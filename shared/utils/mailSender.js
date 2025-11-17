import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function mailSender(email, title, body){

    try{
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            secure: false
        });

        const info = transporter.sendMail({
            from: `Prarabdh ${process.env.MAIL_USER}`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("Info:", info);

        return info;
    } catch(error){
        return resizeBy.status(500).json({
            success: false,
            message: "Internal server error!",
            error
        });
    };
}

export {
    mailSender
}