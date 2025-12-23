import { Address } from "../models/Address";
import { Product } from "../models/Product";
import { Inventory } from "../models/Inventory";
import { Order } from "../models/Order";
import PDFDocument, { path } from "pdfkit";
import fs from "fs";
import mongoose from "mongoose";
import { success } from "zod";


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

        const { items, shippingAddress, billingAddress, paymentMethod  } = req.body;

        if(!Array.isArray(items || items.length === 0)){
            throw new Error("Order items are required")
        }

        const orderItems = [];
        let inventoryLogs = [];

    for( const item of items){
        const product = await Product.findById(item.product).session(session)

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if(product.productStock < item.quantity){
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.productName}`
            })
        }

        product.productStock -= item.quantity;
        await product.save({ session });

        orderItems.push({
            product: product._id,
            quantity: item.quantity,
            price: product.productPrice
        });

        inventoryLogs.push({
            createdBy: userId,
            product: product._id,
            change: -item.quantity,
            reason: "Order placed"
        });
    }

        const order = await Order.create(
            [{
                orderNumber: `ORD-${Date.now()}`,
                user: userId,
                items: orderItems,
                shippingAddress,
                billingAddress,
                paymentMethod
            }], { session });

        if(inventoryLogs.length){
            await Inventory.insertMany(inventoryLogs, { session });
        }

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order created successfully!",
            order: order[0]
        });
    } catch(error){
        await session.abortTransaction();
        console.error("Create order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    } finally{
        session.endSession();
    }
}

async function getAllOrders(req, res){

    try{
        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Admin can only get the orders!"
            });
        };

        const orders = await Order.find()
        .populate("customer", "firstName lastName email")
        .populate({
            path: "items.product",
            select: "productName productPrice productStock"
        }).sort({ createdAt: -1 });

        if(!orders || orders.length === 0){
            return res.status(404).json({
                success: false,
                message: "Order could not found!"
            })
        }

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
};

async function getMyOrders(req, res){
    try{
        if(!req.user || req.user.role !== "Customer"){
            return res.status(403).json({
                success: false,
                message: "Unauthorized!"
            });
        };

        const orders = await Order.find({ user: getUserId(req)})
        .populate("items.product", "productName productPrice productImage")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: false,
            message: "Order fetched successfully!",
            count: orders.length,
            orders
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
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
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        }

        if(req.user.role === "Customer" && String(order.user) !== String(userId)){
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Customer can cancel their own order!"
            });
        };

        if(order.orderStatus === "Cancelled"){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Order already cancelled!"
            });
        };

        if(req.user.role !== "Customer" && !req.user.role !== "Admin"){
            await session.abortTransaction();
            return res.status(403).json({
                structuredClone: false,
                message: "Only admin and customer can cancel order!"
            });
        }

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
        order.cancelledAt = new Date();
        await order.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully!",
            order
        });
    } catch(error){
        await session.abortTransaction();
        console.error("Cancelled order error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    } finally{
        session.endSession();
    }
};

async function updateOrderStatus(req, res){

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        if(!req.user || req.user.role !== "Admin"){
            return res.status(403).json({
                success: false,
                message: "Only admin can update order status!"
            });
        };

        const orderId = req.params.id;
        const { status } = req.body;
        const order = await Order.findById(orderId).session(session);

        if(!order){
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        const allowedStatuses = [
            "Processing",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if(!allowedStatuses.includes(status)){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            })
        }

        if(order.orderStatus === "Cancelled" || order.Status === "Delivered"){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Order status can no longer be changed!"
            })
        }

        if(status === "Packed"){
            order.packedAt = new Date();
        }

        if(status === "Shipped"){
            order.shippedAt = new Date();
        }

        if(status === "Delivered"){
            order.deliveredAt = new Date();
        }

        if(status === "Cancelled"){
            order.cancelledAt = new Date()
        }

        if(status === "Cancelled" && order.orderStatus !== "Cancelled"){
            for(const item of order.items){
                const product = await Product.findById(item.product).session(session);
                if(!product){
                    continue;
                }
                product.productStock += item.quantity;
                await product.save({ session });

                await Inventory.create(
                    [{
                        createdBy: req.user._id,
                        product: product._id,
                        change: item.quantity,
                        reason: "Order cancelled by admin"
                    }],
                    { session }
                )
            }
        }

        order.orderStatus = status;
        await order.save();

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully!",
            order
        })
    } catch(error){
        await session.abortTransaction();
        console.error("updated order status:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        })
    } finally{
        session.endSession();
    }
}

async function generateInvoice(req, res){

    try{
        const orderId = req.params.id;
        const userId = req.user._id;
        const role = req.user?.role;

        const order = await Order.findById(orderId)
        .populate("customer", "firstName lastName email")
        .populate("items.product", "productName productPrice");

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found!"
            });
        };

        if(role === "Customer" && String(order.user._id) !== String(userId)){
            return res.status(403).json({
                success: false,
            message: "You are not allowed to access this invoice"
            })
        }
        const invoiceDir = path.resolve(process.cwd(), "invoices");
        if(!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

        const fileName= `invoice_${order.orderNumber}.pdf`;
        const filePath = path.join(invoiceDir, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);
        doc.fontSize(20).text("Order Invoice", { align: "center" });
        doc.moveDown();

        const customerName = `${order.user.name}`;
        doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
        doc.text(`Customer Id : ${order.user._id}`);
        doc.text(`Customer name: ${customerName}`)
        doc.text(`Email: ${order.user.email}`);
        doc.text(`Order Date: ${order.createdAt.toLocaleString()}`);
        doc.text(`Order Status: ${order.orderStatus}`);
        doc.moveDown();

        const addr = order.shippingAddress;
        doc.text("Shipping Address:");
        doc.text(`${addr.name} 
            ${addr.addressLine1}
            ${addr.addressLine2 || ""}
            ${addr.city}, ${addr.state} 
            ${addr.country} - ${addr.pinCode}`
        );

        doc.moveDown();

        doc.fontSize(14).text(`Items:`);
        doc.moveDown(0.5);

        order.items.forEach((item, index) => {
            doc.fontSize(12).text(
                `${index + 1}. ${item.product.productName} * ${item.quantity} = ₹${item.total}`
            )
        });

        doc.moveDown();

        doc.text(`SubTotal: ₹${order.subTotal}`);
        doc.text(`Shipping: ₹${order.shippingPrice}`);
        doc.text(`Discount: ₹${order.discount}`);
        doc.moveDown();

        doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
            algn: "right"
        });

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, fileName, () => {
                try{
                    fs.unlinkSync(filePath);
                } catch(_){}
            });
        });

        writeStream.on("error", (error) => {
            console.error("Invoice generation error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to generate invoice",
                error: error.message
            });
        });
    } catch(error){
        console.error("Generate invoice error:", error)
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
    getMyOrders,
    updateOrderStatus,
    generateInvoice
};