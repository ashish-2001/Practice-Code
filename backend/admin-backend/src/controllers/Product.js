import z, { success } from "zod";

const productsValidator = z.object({
    productName: z.string().min(1, "Product name is too small!"),
    productDescription: z.string().min(1, "Product description is too small!"),
    productPrice: z.number(),
    productStock: z.number(),
    productImage: z.string(),
});

async function createProduct(req, res){

    const { categoryId } = req.body;

    const parsedResult = productsValidator.safeParse(req.body);

    if(!parsedResult.success){
        return res.status(401).json({
            success: false,
            message: "All the fields are required!"
        });
    };

    const {
        productName,
        productDescription,
        productPrice,
        productStock,
        productImage
    } = parsedResult.data;

    const 
}