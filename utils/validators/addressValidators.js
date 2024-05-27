const { check } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');

exports.addAddressValidator = [
	check('street').notEmpty().withMessage('Street required'),
	check('governorate').notEmpty().withMessage('governorate required'),
	check('apartmentNumber').notEmpty().withMessage('Apartment number required'),
	check('floor').notEmpty().withMessage('Floor required'),
	check('phoneNumber')
		.notEmpty()
		.withMessage('Phone number is required')
		.isMobilePhone('ar-EG')
		.withMessage('Invalid Egyptian phone number'),
	check('additionalDescription').optional(),

	validorMiddleware,
];
