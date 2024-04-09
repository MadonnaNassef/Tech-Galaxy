const express = require('express');

const {
	regiterValidator,
	loginValidtor,
	resetPasswordValidator,
} = require('../utils/validators/authValidators');

const router = express.Router();

const {
	register,
	login,
	forgetPassword,
	verifyResetCode,
	resetPassowrd,
	verifyEmail,
	verifyEmailLater,
} = require('../services/authService');

router.post('/register', regiterValidator, register);
router.post('/verifyEmail', verifyEmail);
router.post('/verifyEmailLater', verifyEmailLater);

router.post('/login', loginValidtor, login);

router.post('/forget-password', forgetPassword);
router.post('/verifyResetCode', verifyResetCode);
router.put('/resetPassword', resetPasswordValidator, resetPassowrd);

module.exports = router;
