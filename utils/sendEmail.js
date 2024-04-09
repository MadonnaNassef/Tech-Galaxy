const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
	// Create transporter
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT, // if not secure port = 587
		secure: true,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	// Define content
	const mailOptions = {
		from: 'Tech Galaxy <techgalaxytechnology@gmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
	};
	// Send the mail
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
