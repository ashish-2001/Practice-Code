import z from "zod";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

const categoryValidator = z.object({
    categoryName: z.string().min(1, "Category is too small!"),
    categoryDescription: z.string().min(1, "Category description is too small!")
});

async function createCategory(req, res){

    try{
        const parsedResult = categoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            categoryName,
            categoryDescription
        } = parsedResult.data;

        const existingCategory = await Category.findOne({
            categoryName: categoryName.trim()
        });

        if(existingCategory){
            return res.status(400).json({
                success: false,
                message: "Category already exists!"
            });
        };

        
        const createdBy = req.user._id;

        if(!createdBy){
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User not found!"
            });
        };

        let thumbnailImage = "";

        if(req.files?.thumbnailImage){
            try{
                const uploaded = await uploadImageToCloudinary(
                    req.files.thumbnailImage,
                    "categories",
                    1000,
                    1000
                )

                thumbnailImage = uploaded.secure_url
            }catch(error){
                return res.status(500).json({
                    success: false,
                    message: "Internal server error!",
                    error: error.message
                })
            }
        }

        const categoryDetails = await Category.create({
            categoryName: categoryName.trim(),
            categoryDescription: categoryDescription.trim(),
            thumbnailImage,
            createdBy
        });

        return res.status(200).json({
            success: true,
            message: "Category created successfully!",
            data: categoryDetails
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "internal server error!",
            error
        });
    };
};

async function showAllCategories(req, res){
    try{
        const allCategories = await Category.find({}, {
            categoryName: true,
            categoryDescription: true,
            thumbnailImage: true,
            createdBy: true
        }).populate("createdBy", "firstName lastName email");

        if(!allCategories || allCategories.length === 0){
            return res.status(400).json({
                success: false,
                message: "Categories not found!"
            });
        };

        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully!",
            data: allCategories
        });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

async function categoryPageDetails(req, res){

    try{
        const { categoryId } = req.body;

        const selectedCategory = await Category.findById(categoryId);

        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        const selectedProducts = await Product.find({
            category: categoryId
        }).populate("createdBy", "firstName lastName email").exec();

        if(!selectedProducts.length){
            return res.status(401).json({
                success: false,
                message: "Products not found in the the selected category!"
            });
        };
        const differentProducts = await Product.find({
            category: {
                $ne: categoryId
            }
        }).populate("createdBy", "firstName lastName email").limit(10);

        const mostSellingProducts = await Product.find({}).populate("createdBy", "firstName lastName email").sort({
            sold: -1
        }).limit(10);

        return res.status(200).json({
            success: true,
            message: "Product data fetched successfully!",
            selectedCategory,
            selectedProducts,
            differentProducts,
            mostSellingProducts
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
};

const addProductToCategoryValidator = z.object({
    categoryId: z.string().min(1, "Category id is is required!"),
    productId: z.string().min(1, "Product id is required!")
});

async function addProductToCategory(req, res){

    try{
        
        const parsedResult = addProductToCategoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const {
            categoryId,
            productId
        } = parsedResult.data;

        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        const product = await Product.findById(productId);

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(category.products.includes(productId)){
            return res.status(409).json({
                success: false,
                message: "Product already exists in the category!"
            });
        };

        category.products.push(productId);
        await category.save();

        return res.status(200).json({
            success: true,
            message: "Product added to the category successfully!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    }
}

export {
    createCategory,
    showAllCategories,
    categoryPageDetails,
    addProductToCategory
}