const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Add address
// POST /api/address
// Protected/ User
exports.addAddress = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			$addToSet: { address: req.body },
		},
		{ new: true }
	);

	res.status(200).json({
		status: 'success',
		message: 'Address added',
		data: user.address,
	});
});

// Remove address
// Delete /api/address/:addressId
// Protected/ User
exports.removeAddress = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{
			$pull: { address: { _id: req.params.addressId } },
		},
		{ new: true }
	);

	res.status(200).json({
		status: 'success',
		message: 'Address removed',
		data: user.address,
	});
});

// Get logged user addresses
// GET api/address
// Protected/ User
exports.getAddress = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user._id).populate('address');

	res.status(200).json({
		status: 'success',
		results: user.address.length,
		data: user.address,
	});
});

// // Update address
// // PUT /api/address/:addressId
// // Protected/ User
// exports.updateAddress = asyncHandler(async (req, res, next) => {
// 	const user = await User.findByIdAndUpdate(
// 		req.user._id,
// 		{
// 			$addToSet: { address: req.body },
// 		},
// 		{ new: true }
// 	);

// 	res.status(200).json({
// 		status: 'success',
// 		message: 'Address Updated',
// 		data: user.address,
// 	});
// });
