import z, { success } from "zod";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";


const categoryValidator = z.object({
    categoryName: z.string().min(1, "Category name is too small!"),
    categoryDescription: z.string().min(1, "Category description is too small!")
});

async function createCategory(req, res){

    try{

        const parsedResult = categoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: true,
                message: "All fields are required!"
            });
        };

        let thumbnailImage = req.files?.thumbnailImage;

        const { categoryName, categoryDescription } = parsedResult.data;

        const existingCategory = await Category.findOne({
            categoryName: categoryName.trim()
        });

        if(existingCategory){
            return res.status(403).json({
                success: false,
                message: "Category already exists!"
            });
        };

        if(thumbnailImage){
            const uploaded = await uploadImageToCloudinary(
                thumbnailImage,
                "categories",
                1000,
                1000
            )

            thumbnailImage = uploaded.secure_url;
        }

        const categoryDetails = await Category.create({
            categoryName: categoryName,
            categoryDescription,
            thumbnailImage
        });

        return res.status(200).json({
            success: true,
            message: "Category created successfully!",
            categoryDetails
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
}

async function getAllCategories(req, res){

    try{

        const allCategories = await Category.findOne({}, {
            categoryName: true,
            categoryDescription: true
        });

        if(!allCategories || allCategories.length < 1 ){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        return res.status(200).json({
            success: false,
            message: "ALl categories fetched successfully!",
            allCategories
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};

async function getCategoryPageDetails(req, res){

    try{

        const categoryId = req.body;

        const selectedCategory = await Category.findById(categoryId)
        .populate({
            path: "products",
            match: {
                status: "Published"
            },
            populate: ([{
                path: "Admin"
            },
            {
                path: "ratingAndReviews"
            }])
        });

        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            });
        };

        if(selectedCategory.products.length === 0){
            console.log("No products found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No products found for the selected category."
            })
        };

        const selectedProducts = selectedCategory.products;

        const categoryExceptSelected = await Category.find({
        _id: {
            $ne: categoryId
        }})
        .populate({
            path: "products",
            match: {
                status: "Published"
            },
                populate: ([{
                    path: "Admin"
                },
                {
                    path: "ratingAndReviews"
                }
            ])
        });

        const differentProducts = [];

        for(const category of categoryExceptSelected){
            differentProducts.push(...category.products);
        };

        const allCategories = await Category.find().populate({
            path: "products",
            match: {
                status: "Published"
            },
            populate: ([{
                path: "Admin"
            },
            {
                path: "ratingAndReviews"
            }
            ])
        });

        const allProducts = allCategories.flatMap((category) => category.products);
        const mostSellingProducts = allProducts.sort((a, b) => b.sold - a.sold).slice(0, 10);

        return res.status(200).json({
            success: true,
            message: "All products fetched successfully!",
            data: {
                selectedProducts,
                differentProducts,
                mostSellingProducts
            }
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
};

const editCategoryValidator = z.object({
    categoryName: z.string().min(1, "Category name is required!"),
    categoryDescription: z.string().min(1, "Category description is required!"),
});

async function editCategories(req, res){

    try{

        const parsedResult = editCategoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        
    }
}

const addProductToCategoryValidator = z.object({
    categoryId: z.string().min(1, "Invalid category id"),
    productId: z.string().min(1, "Invalid product id")
});

async function addProductToTheCategory(req, res){

    try{
        const parsedResult = addProductToCategoryValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(403).json({
                success: false,
                message: "All fields are required!"
            });
        };

        const { categoryId, productId } = parsedResult.data;

        const category = await Category.findById(categoryId);

        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found!"
            })
        }

        const product = await Product.findById(productId);

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            });
        };

        if(category.products.includes(productId)){
            return res.status(402).json({
                success: false,
                message: "Product already exists in the category!"
            });
        };

        category.products.push(productId);
        await Category.save();

        return res.status(200).json({
            success: true,
            message: "Product added to the category!"
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error: error.message
        });
    };
}


export {
    createCategory,
    getAllCategories,
    getCategoryPageDetails,
    addProductToTheCategory
}