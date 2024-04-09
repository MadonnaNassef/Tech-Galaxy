const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const bcrypt = require('bcryptjs');

const sharp = require('sharp');
const { v4: uniqueId } = require('uuid');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const generateToken = require('../utils/generateToken');

// Upload single image
exports.uploadImage = uploadSingleImage('profileImage');

// Manipulate Image
exports.resizeUserImage = asyncHandler(async (req, res, next) => {
	const filename = `user-${uniqueId()}-${Date.now()}.jpeg`;

	if (req.file) {
		await sharp(req.file.buffer)
			.resize(400, 400)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`uploads/users/${filename}`);

		// Save to DB
		req.body.profileImage = filename;
	}
	next();
});

// Create user
// Post method, /api/users
// Private access

exports.createUser = factory.create(User);

// Update User
// PUT /api/users/:id
// Private
exports.updateUser = asyncHandler(async (req, res, next) => {
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			slug: req.body.slug,
			phone: req.body.phone,
			email: req.body.email,
			profileImage: req.body.profileImage,
			role: req.body.role,
		},
		{
			new: true,
		}
	);
	if (!document) {
		return next(new ApiError(`Document not found for ${req.params.id}`, 404));
	}
	res.status(200).json({ data: document });
});

// Change password
// PUT /api/users/change-password/:id
// Public
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 12);
	const document = await User.findByIdAndUpdate(
		req.params.id,
		{ password: hashedPassword, passChangedAt: Date.now() },
		{
			new: true,
		}
	);
	if (!document) {
		return next(new ApiError(`Document not found for ${req.params.id}`, 404));
	}
	res.status(200).json({ data: document });
});

// Delete User
// Delete /api/users/:id
// Private
exports.deleteUser = factory.delete(User);

// Get Users
// Get /api/users
// Public access
exports.getUsers = factory.getDocuments(User);

// Get specific getUser by id
// GET /api/users/:id
// Public Access

exports.getUser = factory.getSpecificDoc(User);

// USER CAN USE THESE

// Get my data
// GET /api/users/userProfile
// Protect Access
exports.getLoggedData = asyncHandler(async (req, res, next) => {
	req.params.id = req.user._id;
	next();
});

// Change my password
// GET /api/users/changepassword
// Protect Access
exports.changePassword = asyncHandler(async (req, res, next) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 12);
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ password: hashedPassword, passChangedAt: Date.now() },
		{
			new: true,
		}
	);
	if (!user) {
		return next(new ApiError(`Document not found for ${req.user._id}`, 404));
	}

	const token = generateToken(user._id);
	res.status(200).json({ data: user, token });
});

// Update my data (without password, role)
// Put /api/users/updateProfile
// Protected
exports.updateProfile = asyncHandler(async (req, res, next) => {
	const updatedUser = await User.findByIdAndUpdate(
		req.user._id,
		{
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			profileImage: req.body.profileImage,
		},
		{ new: true }
	);

	res.status(200).json({ data: updatedUser });
});

// Deactivate
// delete /api/users/deactivate
// Protected
exports.deactivate = asyncHandler(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });

	res.status(204).json({ message: 'Account deactivated' });
});
