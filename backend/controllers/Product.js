import z from "zod";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

const productValidator = z.object({
    productName: z.string().min(1, "Product name is required!"),
    productDescription: z.string().min(1, "Product description is required!"),
    productPrice: z.number(),
    productStock: z.number()
});

async function createProduct(req, res){

    try{
        const parsedResult = productValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(402).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const  { categoryId } = req.body;
        const files = req.files || {};
        const productImageFiles = files?.productImage;

        if(!productImageFiles || (Array.isArray(productImageFiles) && productImageFiles.length === 0)){
            return res.status(404).json({
                success: false,
                message: "Product image is required!"
            });
        }

        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        const fileObj = Array.isArray(productImageFiles) ? productImageFiles[0] : productImageFiles;
        const uploaded = await uploadImageToCloudinary(fileObj, process.env.FOLDER_NAME || "products");
        const productImageUrl = uploaded?.secure_url || "";
        const createdBy = req.admin?.adminId ?? null;

        const {
            productName,
            productDescription,
            productPrice,
            productStock,
        } = parsedResult.data;

        const productDetails = await Product.create({
            productName,
            productDescription,
            productPrice,
            productStock,
            createdBy,
            category: categoryId,
            productImage: productImageUrl
        });

        if(!category.products) category.products = [];
        await category.products.push(productDetails._id);
        await category.save();

        return res.status(200).json({
            success: true,
            message: "Product created successfully!",
            data: productDetails
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function getAllProducts(req, res){

    try{
        
        const allProducts = await Product.find({}, {
            productName: true,
            productDescription: true,
            productStock: true,
            productPrice: true,
            productImage: true,
            createdBy: true
        }).populate("createdBy").populate("category").exec();

        if(!Array.isArray(allProducts) || allProducts.length === 0){
            return res.status(402).json({
                success: false,
                message: "No products found!",
                data: []
            });
        };

        return res.status(200).json({
            success: true,
            message: "All products fetched successfully!",
            data: allProducts
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function editProducts(req, res){    
    try{

        const {
            productId,
            productName,
            productDescription,
            productPrice,
            productStock,
            category
        } = req.body;

        if(!productId){
            return res.status(402).json({
                success: false,
                message: "Product Id is required!"
            });
        };

        const product = await Product.findById(productId);

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        const adminId = req.admin?.adminId;
        if(!adminId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        };

        if(product.createdBy && product.createdBy.toString() !== adminId){
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not the owner of this product!"
            })
        }

        if(category){
            const categoryId = (typeof category === "object") ? category._id: category ;
            const newCategory = await Category.findById(categoryId);

            if(!newCategory){
                return res.status(402).json({
                    success: false,
                    message: "Category not found!"
                });
            };
            
            if(product.category && product.category.toString() !== category.toString()){
                await Category.findByIdAndUpdate(product.category, {
                    $pull: {
                        products: product._id
                    }
                })
            }

            if(!Array.isArray(newCategory.products) || !newCategory.products.includes(product._id)){
                newCategory.products = newCategory.products || [];
                newCategory.products.push(product._id);
                await newCategory.save();
            }

            product.category = categoryId;
        };

        if(req.files && req.files.productImage){
            const thumbnail = Array.isArray(req.files.productImage) ? req.file.productImage[0] : req.files.productImage;
            const uploadResult = await uploadImageToCloudinary( thumbnail, process.env.FOLDER_NAME || "products");
            product.productImage = uploadResult.secure_url || product.productImage;

        };

        if(productName !== undefined){
            product.productName = productName;
        }

        if(productDescription !== undefined){
            product.productDescription = productDescription;
        };

        if(productPrice !== undefined){
            product.productPrice = Number(productPrice);
        }

        if(productStock !== undefined){
            product.productStock = Number(productStock);
        }

        await product.save();

        const updatedProduct = await Product.findOne({ _id: productId })
        .populate({
            path: "createdBy"
        }).populate("category").exec();

        return res.status(200).json({
            success: true,
            message: "Product has been edited successfully!",
            data: updatedProduct
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

async function deleteProduct(req, res){

    try{

        const { productId } = req.body;

        const product = await Product.findById(productId);

        if(!product){
            return res.status(402).json({
                success: false,
                message: "Product not found!"
            });
        };

        const adminId = req.admin?.adminId;
        if(!adminId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        if(product.createdBy && product.createdBy.toString() !== adminId){
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not the owner of this product!"
            });
        };

        const customers = Array.isArray(product.customerPurchased) ? product.customerPurchased : [];

        for(const customerId of customers){
            await User.findByIdAndUpdate(customerId, {
                $pull: {
                    customerPurchased: productId
                }
            });
        };

        if(product.category){
            await Category.findByIdAndUpdate(product.category, {
                $pull: {
                    products: productId
                }
            });
        };
        
        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

async function searchProduct(req, res){

    try{
        const { searchQuery } = req.body;

        if(!searchQuery || String(searchQuery).trim() === ""){
            return res.status(402).json({
                success: false,
                message: "Search query is required!"
            });
        }

        const regex = {
            $regex: searchQuery,
            $options: "i"
        };

        const products = await Product.find({
            $or: [
                {
                    productName:regex
                },
                {
                    productDescription: regex
                }
            ]
        }).populate("category").populate("createdBy").exec();

        return res.status(200).json({
            success: true,
            message: "Product search is successful!",
            data: products
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};


export {
    createProduct,
    getAllProducts,
    editProducts,
    deleteProduct,
    searchProduct
};