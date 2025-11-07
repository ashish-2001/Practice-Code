import z from "zod";

const contactUsValidator = z.object({
    firstName: z.string().min(1, "First name is required!"),
    lastName: z.string().min(1, "Last name is required!"),
    email: z.string().email("Invalid email address!"),
    countryCode: z.string().min(1, "Country code is required!"),
    contactNumber: z.string().min(10, "Contact number should be of 10 digits!"),
    message: z.string().min(1, "Message is required!")
});

async function contactUs(req, res){

    try{

        const parsedResult = contactUsValidator.safeParse(req.body);

        if(!parsedResult.success){
            return res.status(404).json({
                success: false,
                message: "All fields are required!"
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
                        return`<p>${key}: ${data[key]} </p>`
                    })}
                </body>
            </html>`
        );

        if(info){
            return res.status(200).json({
                success: false,
                message: "Email sent successfully!"
            });
        } else{
            return res.status(404).json({
                success: false,
                message: "Email does not sent!"
            });
        };
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

export {
    contactUs
}