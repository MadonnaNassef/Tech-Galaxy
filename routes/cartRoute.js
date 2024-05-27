const express = require('express');

const router = express.Router({ mergeParams: true });

const { authenticated, authorized } = require('../services/authService');
const {
	addProductToCart,
	getLoggedCart,
	deleteProductFromCart,
	clearCart,
	editQuantityInCart,
	applyCoupon,
} = require('../services/cartService');
const {
	addProductToCartValidator,
} = require('../utils/validators/cartValidators');

router.use(authenticated, authorized('user'));

router
	.route('/')
	.post(addProductToCartValidator, addProductToCart)
	.get(getLoggedCart)
	.delete(clearCart);

router.put('/applyCoupon', applyCoupon);
router.route('/:itemId').put(editQuantityInCart).delete(deleteProductFromCart);

module.exports = router;
