import z, { success } from "zod"

const inventoryValidator = z.object({
    change: z.number().min(1, "Inventory is required!"),
    reason: z.enum(["Purchase", "Order Cancelled", "Stock update"]),

})

async function inventory(Req, res){

    const parsedResult = inventoryValidator.safeParse(requestAnimationFrame.body);

    if(!parsedResult.success){
        return res.status(403).json({
            success: false,
            message: "All the fields are required!"
        });
    };

    const {
        change,
        reason
    }  = parsedResult.data;
}