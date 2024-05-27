const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const sendMail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

const generateVerificationCode = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

const hashData = (data) =>
	crypto.createHash('sha256').update(data).digest('hex');

const sendVerificationEmail = async (user, verificationCode) => {
	const message = `
Dear ${user.name},
  
Thank you for registering with our service. To complete your registration, please verify your email address using the code below:
	  
Verification code: ${verificationCode}
	  
If you did not request this verification, you can safely ignore this email.
  
Best regards,
Tech Galaxy
	`;
	try {
		await sendMail({
			email: user.email,
			subject: 'Verify Email',
			message,
		});
	} catch (err) {
		user.emailVerificationToken = undefined;
		user.emailVerified = undefined;
		user.emailVerificationExpiry = undefined;

		await user.save();
		throw new ApiError('Error in sending verification code email', 500);
	}
};

// Register
// POST /api/auth/register
// Public
exports.register = asyncHandler(async (req, res, next) => {
	const verificationCode = generateVerificationCode();
	const hashedVerificationCode = hashData(verificationCode);

	// Create user
	const user = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		phone: req.body.phone,
		emailVerificationToken: hashedVerificationCode,
		emailVerificationExpiry: Date.now() + 20 * 60 * 1000,
		emailVerified: false,
	});

	await sendVerificationEmail(user, verificationCode);

	// Generate JWT token
	const token = generateToken(user._id);
	res.status(201).json({
		status: 'success',
		data: user,
		token,
		message: 'Verification email sent',
	});
});

// Verify Mail Later
// POST /api/auth/verifyMailLater
// Public
exports.verifyEmailLater = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ApiError('User not found for this email'), 404);
	}
	if (user.emailVerified) {
		return next(new ApiError('Email already verified'), 400);
	}

	const verificationCode = generateVerificationCode();
	const hashedVerificationCode = hashData(verificationCode);

	user.emailVerificationToken = hashedVerificationCode;
	user.emailVerificationExpiry = Date.now() + 20 * 60 * 1000;
	user.emailVerified = false;
	await user.save();

	await sendVerificationEmail(user, verificationCode);

	res
		.status(200)
		.json({ status: 'success', message: 'Verification Email sent to user' });
});

// Verify Mail code
// POST /api/auth/verifyMail
// Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
	const hashedVerificationCode = hashData(req.body.verificationCode);

	const user = await User.findOne({
		emailVerificationToken: hashedVerificationCode,
		emailVerificationExpiry: { $gt: Date.now() },
	});
	if (!user) {
		return next(new ApiError(' code no longer valid'), 404);
	}

	user.emailVerified = true;
	user.emailVerificationToken = undefined;
	user.emailVerificationExpiry = undefined;
	await user.save();

	res
		.status(200)
		.json({ status: 'success', message: 'Verification completed' });
});

// Login
// POST /api/auth/login
// Public
exports.login = asyncHandler(async (req, res, next) => {
	// Login
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ApiError('Incorrect Email', 401));
	}

	const isCorrect = await bcrypt.compare(req.body.password, user.password);
	if (!isCorrect) {
		return next(new ApiError('Incorrect password', 401));
	}
	user.active = true;
	user.save();
	// Generate JWT token
	const token = generateToken(user._id);
	res.status(201).json({ data: user, token });
});

// Make sure user is logged in (authentication)
exports.authenticated = asyncHandler(async (req, res, next) => {
	// Check if token exist, if exist get it
	let token;
	if (req.headers.authorization) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) {
		return next(
			new ApiError('You are not logged in, please login to get access', 401)
		);
	}
	// verify the token (it is incorrect and not expired)
	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	// check if user exist
	const loggedUser = await User.findById(decoded.userId);
	if (!loggedUser) {
		return next(new ApiError('User does not exist, failed to access', 401));
	}
	// check if user changed password after token was created
	if (loggedUser.passChangedAt) {
		const passChangedAt = parseInt(
			loggedUser.passChangedAt.getTime() / 1000,
			10
		);
		if (passChangedAt > decoded.iat) {
			return next(
				new ApiError(
					'Token no longer valid due to change in password, please login again',
					401
				)
			);
		}
	}
	req.user = loggedUser;
	next();
});

// authorization
exports.authorized = (...roles) =>
	asyncHandler(async (req, res, next) => {
		const userAuthorized = await roles.includes(req.user.role);
		if (!userAuthorized) {
			return next(
				new ApiError('User is not authorized to access this route'),
				403
			);
		}
		next();
	});

// Forget Password to send mail with reset code
// /api/auth/forget-password
// Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ApiError('User not found for this email'), 404);
	}
	const resetCode = generateVerificationCode();

	const hashedResetCode = hashData(resetCode);

	// store code in DB
	user.passwordResetCode = hashedResetCode;
	// code expires in 10 mins
	user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
	user.passwordResetVerified = false;

	await user.save();

	// send reset code in an email
	const message = `Dear ${user.name},
    
We received a request to reset your password for your account with us. If you did not make this request, please disregard this email. Otherwise, please use the following verification code to reset your password:
    
Verification Code: ${resetCode}
    
This code will expire in 10 minutes for security purposes. If you need further assistance, please don't hesitate to contact us.
    
Thank you for helping us keep your account secure.

Best regards,
Tech Galaxy`;

	try {
		await sendMail({
			email: user.email,
			subject: 'Reset Password',
			message,
		});
	} catch (err) {
		user.passwordResetCode = undefined;
		user.passwordResetExpiry = undefined;
		user.passwordResetVerified = undefined;

		await user.save();
		return next(new ApiError('Error in sending verification code email'), 500);
	}

	res.status(200).json({ status: 'success', message: 'Email sent to user' });
});

// Verify code
// /api/auth/verifyResetCode
// Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
	const hashedResetCode = hashData(req.body.resetCode);

	const user = await User.findOne({
		passwordResetCode: hashedResetCode,
		passwordResetExpiry: { $gt: Date.now() },
	});
	if (!user) {
		return next(new ApiError('Reset code no longer valid'), 404);
	}

	user.passwordResetVerified = true;

	await user.save();

	res.status(200).json({ status: 'success', message: 'Reset code is valid' });
});

// Reset Password
// /api/auth/resetPassword
// Public
exports.resetPassowrd = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email.trim() });
	if (!user) {
		return next(new ApiError('User not found for this email'), 404);
	}
	if (!user.passwordResetVerified) {
		return next(new ApiError('Reset code not verified'), 400);
	}

	const hashedPassword = await bcrypt.hash(req.body.password, 12);

	user.password = hashedPassword;

	user.passwordResetCode = undefined;
	user.passwordResetExpiry = undefined;
	user.passwordResetVerified = undefined;

	await user.save();

	const token = generateToken(user._id);
	res.status(200).json({ token });
});
