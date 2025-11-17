import z from "zod";
import { Category } from "../../../../shared/models/Category.js";
import { Product } from "../../../../shared/models/Product.js";
import { User } from "../../../../shared/models/User.js";
import { uploadImageToCloudinary } from "../../../../shared/utils/imageUploader.js";

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

        const productImage = req.files?.productImage;

        const {
            productName,
            productDescription,
            productPrice,
            productStock,
        } = parsedResult.data;

        if(!productImage){
            return res.status(402).json({
                success: false,
                message: "Product image is required!"
            });
        };

        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(402).json({
                success: false,
                message: "Category not found!"
            });
        };

        const productImagePath = productImage[0]?.path

        const createdBy = req.seller?.sellerId;

        const productDetails = await Product.create({
            productName,
            productDescription,
            productPrice,
            productStock,
            createdBy,
            category: categoryId,
            productImage: productImagePath
        });

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
        }).populate("createdBy").exec();

        if(!allProducts){
            return res.status(402).json({
                success: false,
                message: "No products found!"
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

async function getSellerProducts(req, res){

    try{

        const sellerId = req.seller?.sellerId;

        const seller = await User.findById(sellerId);

        if(!seller){
            return res.status(402).json({
                success: false,
                message: "Seller not found!"
            });
        };

        const allProducts = await Product.find({
            createdBy: sellerId
        });

        if(!allProducts){
            return res.status(402).json({
                success: false,
                message: "Products data could not be fetched!"
            });
        };

        return res.status(200).json({
            success: true,
            message: "Products data has been fetched successfully!",
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
            return res.status(402).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(category){
            const categoryId = typeof category === "object" ? category._id: category ;
            const categoryExists = await Category.findById(categoryId);

            if(!categoryExists){
                return res.status(402).json({
                    success: false,
                    message: "Category not found!"
                });
            };
            product.category = categoryId;
        };

        if(req.files && req.files?.productImage){
            const thumbnail = req.files?.productImage;
            const productImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME || "default",
            )

            product.productImage = productImage.secure_url;

        };

        if(productName){
            product.productName = productName;
        }

        if(productDescription){
            product.productDescription = productDescription;
        };

        if(productPrice){
            product.productPrice = productPrice;
        }

        if(productStock){
            product.productStock = productStock;
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

        const customers = product.customerPurchased;

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

        if(!searchQuery || searchQuery.trim() === ""){
            return res.status(402).json({
                success: false,
                message: "Search query is required!"
            });
        }

        const products = await Product.find({
            $or: [
                {
                    productName: {
                        $regex: searchQuery,
                        $options: "i"
                    },

                    productDescription: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            ]
        });

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

}


export {
    createProduct,
    getAllProducts,
    getSellerProducts,
    editProducts,
    deleteProduct,
    searchProduct
}