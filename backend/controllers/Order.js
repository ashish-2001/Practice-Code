import { Address } from "../models/Address";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { Order } from "../models/Order";
import PDFDocument, { path } from "pdfkit";
import fs from "fs";
import mongoose from "mongoose";


const getUserId = (req) => req.user?.userId || req.user?._id;

async function createOrder(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        const userId = getUserId(req);

        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        };

        const { items, paymentMethod, addressId } = req.body;

        if(!Array.isArray(items || items.length || !addressId)){
            return res.status(403).json({
                success: false,
                message: "Items and addressId is required!"
            });
        }

        const address = await Address.findById(addressId).session(session);

        if(!address || String(address.user) !== String(userId)){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid address!"
            });
        };

        let totalAmount = 0;
        const orderItems = [];
        let inventoryLogs = [];

        for( const item of items){
            if(!item.product || !Number.isInteger(item.quantity) || item.quantity <= 0){
                await session.abortTransaction();
                return res.status(403).json({
                    success: false,
                    message: `Product not found:- ${item.product}`
                })
            }

            const product = await Product.findById(item.product).session(session);

            if(!product){
                return res.status(403).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if(product.productStock < item.quantity){
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for the product ${product.productName}`
                })
            }

            product.productStock -= item.quantity;

            if(!product.customerPurchased.map(String).includes(String(userId))){
                product.customerPurchased.push(userId);
            }

            await product.save({ session });

            const price = product.productPrice;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price
            });

            totalAmount += price * item.quantity;

            inventoryLogs.push({
                createdBy: userId,
                product: product._id,
                change: item.quantity,
                reason: "Purchase"
            });

            const addressString = `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? "," + address.addressLine1 : ""}, ${address.city}, ${address.state}, ${address.country} - ${address.pinCode}`;

            const createOrder = await Order.create([{
                customer: userId,
                items: orderItems,
                totalAmount,
                paymentMethod: paymentMethod || "Cash on delivery",
                address: addressString,
                paymentStatus: "Pending",
                orderStatus: "Processing"
            }], { session });
        };

        if(inventoryLogs.length){
            await Inventory.insertMany(inventoryLogs, { session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Order created successfully!",
            order: createOrder[0]
        });
    } catch(error){
        try{
            await session.abortTransaction();
            session.endSession();
        } catch(_){}
        console.error("Create order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
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

        const orders = await Order.find()
        .populate("customer", "firstName lastName email")
        .populate({
            path: "items.product",
            select: "productName productPrice productStock createdBy"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            count: orders.length,
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

async function getAdminOrders(req, res){

    try{

        const adminId = getUserId(req);

        const adminProducts = await Product.find({
            createdBy: adminId
        }).select( "_id").lean();

        const adminProductIds = adminProducts.map(p => p._id.toString());

        if(adminProductIds.length === 0){
            return res.status(200).json({
                success: true,
                message: "No products found for this admin!",
                count: 0,
                orders: []
            })
        }

        const orders = await Order.find()
        .populate("customer", "firstName lastName email")
        .populate("items.product","productName productPrice productStock createdBy"
        ).sort({ createdBy: -1 });

        const filtered = orders.map(order => {
            const adminItems = order.items.filter(item => adminProductIds.includes(String(item.product._id)));

            if(adminItems.length === 0){
                return null;
            }

            if(adminItems.length > 0){
                return {
                    _id: order._id,
                    customer: order.customer,
                    orderStatus: order.orderStatus,
                    paymentStatus: order.paymentStatus,
                    totalAmount: order.totalAmount,
                    createdAt: order.createdAt,
                    items: adminItems
                }
            }
        }).filter(Boolean);

        return res.status(200).json({
            success: true,
            message: "admin's orders fetched successfully!",
            count: filtered.length,
            orders: filtered
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    }
}

async function cancelOrder(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const orderId = req.params.id;
        const userId = getUserId(req);

        const order = await Order.findById(orderId).session(session);

        if(!order){
            await session.abortTransaction();

            return res.status(403).json({
                success: false,
                message: "Order not found!"
            });
        }

        if(req.user.role === "Customer" && String(order.customer) !== String(userId)){
            await session.abortTransaction();
            return res.status(400).json({
                structuredClone: false,
                message: "You can cancel your own order only!"
            });
        }

        if(req.user.role !== "Admin" && req.user.role !== "Customer"){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Only Admin and customer can cancel their orders!"
            });
        };

        if(order.orderStatus === "Cancelled"){
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Order already cancelled!"
            });
        };

        for(const item of order.items){
            const product = await Product.findById(item.product).session(session);

        if(!product) continue;

        product.productStock += item.quantity;
        await product.save({ session });

        await Inventory.create([{
            createdBy: userId,
            product:product._id,
            change: item.quantity,
            reason: "Order cancelled!"
        }], { session })
    };

        order.orderStatus = "Cancelled"

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully!",
            order
        });
    } catch(error){
        try{
            await session.abortTransaction();
            session.endSession();
        } catch (_){}
        console.error("Cancelled order error:", error)
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
        };

        const userId = getUserId(req);

        const orders = await Order.find({ customer: userId })
        .populate("items.product", "productName productPrice productImage").sort({ createdAt: -1 });

        return res.status(200).json({
            success: false,
            message: "Customer orders fetched!",
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        if(req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can update order status!"
            });
        };

        const orderId = req.params.id;

        const { status } = req.body;

        const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

        if(!allowedStatuses.includes(status)){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid order status!"
            })
        }

        const order = await Order.findById(orderId).session(session);

        if(!order){
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        if(status === "Cancelled" && order.orderStatus !== "Cancelled"){
            for (const item of order.items){
                const product = await Product.findById(item.product).session(session);

                if(!product){
                    product.productStock += item.quantity;

                    await product.save({ session });

                    await Inventory.create([{
                        createdBy: req.user?.userId,
                        product: product._id,
                        change: item.quantity,
                        reason: "Order Cancelled!"
                    }], { session });
                };
            }
        }

        order.orderStatus = status;
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully!",
            order
        })
    } catch(error){
        try{
            await session.abortTransaction();
            session.endSession();
        } catch(_){}
        console.error("updated order status:", error)
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
        .populate("customer", "firstName lastName email")
        .populate("items.product", "productName productPrice");

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        const invoiceDir = path.resolve(process.cwd(), "invoices");
        if(!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

        const fileName= `invoice_${order._id}.pdf`;
        const filePath = path.join(invoiceDir, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);
        doc.fontSize(20).text("Order Invoice", { align: "center" });
        doc.moveDown();

        const customerName = `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim();
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Customer: ${customerName}`);
        doc.text(`Email: ${order.customer.email || ""}`);
        doc.text(`Order Date: ${order.createdAt.toLocaleString()}`);
        doc.text(`Order Status: ${order.orderStatus}`);
        doc.moveDown();

        doc.text(`Shipping Address: ${order.address.street}, ${order.address.city}`);
        doc.moveDown();

        doc.text("Items:");
        doc.moveDown(0.5);

        order.items.forEach(item => {
            const pname = item.product?.productName || "Product";
            doc.text(`${pname} * ${item.quantity} = ${item.price * item.quantity}`);
        });

        doc.moveDown();

        doc.fontSize(14).text(`Total amount: ₹${order.totalAmount}`, { align: "right" });

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, fileName, (error) => {
                if(error){
                    console.error("Invoice download error:", error);
                    try{
                        fs.unlinkSync(filePath);
                    } catch(_) {}
                } else{
                    try{
                        fs.unlinkSync(filePath);
                    } catch(_){}
                }
            });
        });

        writeStream.on("error", (error) => {
            console.error("Invoice write error:", error);
            return res.status(500).json({
                success: false,
                message: "Error generating invoice",
                error: error.message
            })
        })
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
    cancelOrder,
    getAllOrders,
    getAdminOrders,
    getMyOrders,
    updateOrderStatus,
    generateInvoice
};