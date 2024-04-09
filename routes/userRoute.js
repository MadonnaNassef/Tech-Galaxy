const express = require('express');

const {
	getUserValidator,
	updateUserValidator,
	deleteUserValidator,
	createUserValidator,
	changeUserPasswordValidator,
} = require('../utils/validators/userValidators');

const router = express.Router();

const { authorized, authenticated } = require('../services/authService');

const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	uploadImage,
	resizeUserImage,
	changeUserPassword,
	getLoggedData,
	changePassword,
	updateProfile,
	deactivate,
} = require('../services/userService');

// User can use these
router.get('/userProfile', authenticated, getLoggedData, getUser);

router.put(
	'/changepassword',
	authenticated,
	getLoggedData,
	changeUserPasswordValidator,
	changePassword
);

router.put(
	'/updateProfile',
	authenticated,
	getLoggedData,
	uploadImage,
	resizeUserImage,
	updateUserValidator,
	updateProfile
);

router.delete('/deactivate', authenticated, deactivate);

// Only admin can use these
router
	.route('/')
	.get(authenticated, authorized('admin', 'manager'), getUsers)
	.post(
		authenticated,
		authorized('admin'),
		uploadImage,
		resizeUserImage,
		createUserValidator,
		createUser
	);
router
	.route('/:id')
	.get(getUserValidator, getUser)
	.put(
		authenticated,
		authorized('admin'),
		uploadImage,
		resizeUserImage,
		updateUserValidator,
		updateUser
	)
	.delete(authenticated, authorized('admin'), deleteUserValidator, deleteUser);

router.put(
	'/change-password/:id',
	authenticated,
	changeUserPasswordValidator,
	changeUserPassword
);

module.exports = router;
