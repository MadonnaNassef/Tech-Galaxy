const { check } = require('express-validator');
const validorMiddleware = require('../../middlewares/validatorMiddleware');
// const Cart = require('../../models/cartModel');

exports.addProductToCartValidator = [
	check('productId').isMongoId().withMessage('Invalid Product ID format'),
	validorMiddleware,
];

// exports.deleteProductFromCartValidator =[
// 	check('userId').custom((value, { req }) =>
// 		Cart.findById(value).then(() => {
// 			if (Cart.user.toString() !== req.user._id.toString()) {
// 				return Promise.reject(
// 					new Error(`You can't add products other people's reviews`)
// 				);
// 			}
// 		})
// 	),
// ]
// exports.updateBrandValidator = [
// 	check(cart).isMongoId().withMessage('Invalid Brand ID format'),
// 	validorMiddleware,
// ];

exports.getLoggerCartValidator = [
	check('id').isMongoId().withMessage('Invalid Brand ID format'),
	validorMiddleware,
];
