function otpTemplate(name){
    
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification Email</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="https://Prarabdh.in"><img class="logo"
                    src="https://i.ibb.co/7Xyj3PC/logo.png" alt="Prarabdh Logo"></a>
            <div class="message">Password update Email</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>click on the link given to reset your password.</p> <br><br>
                <b>Please don't share this password with anyone.</b>
                <p>Prarabdh never asks your password.</p><br>
            </div>
            <div class="support">
                If you need assistance, please feel free to reach out to us at
                <a href="mailto:info@Prarabdh.com">
                    info@Prarabdh.com
                </a>. 
                We are here to help!
            </div>
            <p>Team Prarabdh</p>
        </div>
    </body>
    
    </html>`;
} 

export { 
    otpTemplate
}