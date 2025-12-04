function otpTemplate(otp){
	
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
			<a href="https://Prarabdh-edtech-project.vercel.app"><img class="logo"
					src="https://i.ibb.co/7Xyj3PC/logo.png" alt="Prarabdh Logo"></a>
			<div class="message">OTP Verification Email</div>
			<div class="body">
				<p>Dear User,</p>
				<p>Your one time password to verify your account on Prarabdh is:</p> <br><br>
				<b2 class="highlight">${otp}</b2>
				<p>This OTP is valid for 10 minutes.</p><br>
				<b>Please don't share this otp with anyone.</b>
				<p>Prarabdh never asks otp on calls.</p><br>

				<p>If you didn't request this otp then ignore this email.</p>
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