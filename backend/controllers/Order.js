import { success } from "zod";
import { Address } from "../models/Address";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { Order } from "../models/Order";

async function createOrder(req, res){

    try{

        const userId = req.user._id;

        const { items, paymentMethod, addressId } = req.body;

        if(!items || !items.length || addressId ){
            return res.status(403).json({
                success: false,
                message: "Items and addressId is required!"
            });
        }

        const address = await Address.findById(addressId);

        if(!address || String(address.user) !== String(userId)){
            return req.status(400).json({
                success: false,
                message: "Invalid address!"
            });
        };

        let totalAmount = 0;
        let updatedProducts = [];

        for( const item of items){
            const product = await Product.findById(item.product)
            if(!product){
                return res.status(403).json({
                    success: false,
                    message: `Product not found:- ${item.product}`
                })
            }

            if(product.productStock < item.quantity){
                return res.status(403).json({
                    success: false,
                    message: "Product quantity cannot be negative!"
                });
            }

            product.productStock -= item.quantity;

            if(!product.customerPurchased.includes(userId)){
                product.customerPurchased.push(userId);
            }

            await product.save();
            updatedProducts.push(product);

            totalAmount += item.quantity * product.productPrice;
            
            await Inventory.create({
                createdBy: userId,
                items,
                totalAmount,
                paymentMethod,
                address: `${address.fullName}, ${address.street}, ${address.city}, ${address.state}, ${address.country}- ${address.pinCode}`
            })
        }

        return res.status(200).json({
            success: false,
            message: "Order created successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Interval server error!",
            error: error.message
        });
    }
}

async function getAllOrders(req, res){

    try{
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Admin can only get the orders!"
            });
        };

        const orders = Order.find()
        .populate("customer", "firstName lastName email")
        .populate({
            path: "items-product",
            select: "productName productPrice productStock createdBy",
            populate: {
                path: "createdBy",
                select: "firstName lastName email"
            }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            orders
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
}

async function getSellerOrders(req, res){

    try{
        
        if(req.user.role !== "Seller"){
            return res.status(403).json({
                success: false,
                message: "Only seller can access his products being ordered!"
            });
        };

        const sellerProducts = await Product.find({
            createdBy: req.user._id
        }).select( "_id productName productPrice" );

        if(sellerProducts.length === 0){
            return res.status(200).json({
                success: true,
                message: "No products found for this seller!",
                orders: []
            })
        }

        const sellerProductIds = sellerProducts.map(p => p._id);

        let orders = await Order.find()
        .populate("customer", "firstName lastName email")
        .populate({
            path: "items-product",
            select: "productName productPrice productStock createdBy"
        }).sort({ createdBy: -1 });

        let filteredOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => sellerProductIds.includes(item.product._id));

            if(sellerItems.length > 0){
                return {
                    _id: order._id,
                    customer: order.customer,
                    orderStatus: order.orderStatus,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt,
                    items: sellerItems
                }
            }

            return null;
        }).filter(Boolean);

        return res.status(200).json({
            success: true,
            message: "All the orders of the seller's product has been fetched successfully!",
            count: filteredOrders.length,
            orders: filteredOrders
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function cancelOrders(req, res){

    try{
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if(!order){
            return res.status(403).json({
                success: false,
                message: "Order not found!"
            });
        }

        if(req.user.role === "Customer"){
            if(String(order.customer) !== String(req.user._id)){
                return res.status(400).json({
                    structuredClone: false,
                    message: "You can cancel your own order!"
                })
            }
        }

        if(req.user.role !== "Admin" && req.user.role !== "Customer"){
            return res.status(400).json({
                success: false,
                message: "Only Admin and customer can cancel their order!"
            });
        };

        if(order.orderStatus === "Cancelled"){
            return res.status(403).json({
                success: false,
                message: "Order already has been cancelled!"
            });
        };

        for(const item of order.items){
            const product = await Product.findById(item.product);

            if(product){
                product.productStock += item.quantity;
                await product.save();

                await Inventory.create({
                    createdBy: req.user._id,
                    product:product._id,
                    change: item.quantity,
                    reason: "Order cancelled!"
                })
            }
        }

        order.orderStatus = "Cancelled"

        await order.save();

        return res.status(200).json({
            success: false,
            message: "Order cancelled successfully!",
            order
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    }
}

async function getMyOrders(req, res){
    try{
        if(req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Only customers can view their orders!"
            })
        }

        const orders = await Order.find({ customer: req.user._id })
        .populate({
            path: "items-product",
            select: "productName productPrice productImage"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: false,
            message: "All the customer orders has been fetched!",
            count: orders.length,
            orders
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function updateOrderStatus(req, res){
    try{
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can update order status!"
            });
        };

        const orderId = req.params.id;

        const { status } = req.body;

        const allowedCustomers = ["Processing", "Shipped", "Delivered", "Cancelled"];

        if(!allowedCustomers.includes(status)){
            return res.status(400).json({
                success: false,
                message: "Invalid order status!"
            })
        }

        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        if(order.orderStatus === "Delivered"){
            return res.status(403).json({
                success: false,
                message: "Delivered order cannot be modified!"
            });
        };

        if(status === "Cancelled"){
            
            for (const item of order.items){
                const product = await Product.findById(item.product);

                if(product){
                    product.productStock += item.quantity;

                    await product.save();

                    await Inventory.create({
                        createdBy: req.user._id,
                        product: product._id,
                        change: item.quantity,
                        reason: "Order Cancelled!"
                    });
                };
            }
        }

        order.orderStatus = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully!",
            order
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function generateInvoice(req, res){

    try{
        const orderId = req.params.id;

        const order = await Order.findById(orderId)
        .populate("customer")
        .populate("products.product")
        .populate("address");

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        const doc = new PDFDocument();
        const filePath = `invoices/invoice_${order._id}.pdf`;

        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);
        doc.fontSize(20).text("Order Invoice", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text("Order invoice", { align: "center" });
        doc.text(`Customer: ${order.customer.fullName}`);
        doc.text(`Address: ${order.address.street}, ${order.address.city}`);
        doc.moveDown();

        order.products.forEach(item => {
            doc.text(`${item.product.productName} * ${item.quantity} = ₹${item.price}`);
        });

        doc.moveDown();
        doc.fontSize(16).text(`Total amount: ₹${order.totalAmount}`);

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath);
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Error while generating invoice!",
            error: error.message
        });
    };
};


export {
    createOrder,
    cancelOrders
}