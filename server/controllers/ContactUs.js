import z, { success } from "zod";

const contactUsValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required!"),
    email: z.string().email(1, "Invalid email address!"),
    countryCode: z.string().min(1, "Country code is required!"),
    contactNumber: z.string().regex(/^[0-9+\s]{8,15}$/, "Contact number should be of 10 digits!"),
    message: z.string().min(1, "Message is required")
});

async function contactUs(req, res){

    try{
        const parsedResult = contactUsValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All the fields are required!"
            });
        };

        const {
            firstName,
            lastName,
            email,
            countryCode,
            contactNumber,
            message
        } = parsedResult.data;

        const data = {
            firstName,
            lastName,
            email,
            countryCode,
            contactNumber,
            message
        }

        const info = await mailSender(
            email,
            "Your message has been received!",
            `<html>
                <body>
                    ${Object.keys(data).map((key) => {
                        return `<p>${key} : ${data[key]}</p>`
                    })}
                </body>
            </html>`
        );

        if(info){
            return res.status(200).json({
                success: true,
                message: "Email sent successfully!"
            });
        } else{
            return res.status(404).json({
                success: true,
                message: "Email could not be sent successfully!"
            });
        };
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    }
}