const express = require('express');
const {
	getProductValidator,
	updateProductValidator,
	deleteProductValidator,
	createProductValidator,
} = require('../utils/validators/productValidators');

const router = express.Router();
const {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	uploadProductImages,
	resizeProductImages,
} = require('../services/productService');

const { authorized, authenticated } = require('../services/authService');

const reviewRoute = require('./reviewRoute');

router
	.route('/')
	.get(getProducts)
	.post(
		authenticated,
		authorized('admin', 'manager'),
		uploadProductImages,
		resizeProductImages,
		createProductValidator,
		createProduct
	);
router
	.route('/:id')
	.get(getProductValidator, getProduct)
	.put(
		authenticated,
		authorized('admin', 'manager'),
		updateProductValidator,
		updateProduct
	)
	.delete(
		authenticated,
		authorized('admin'),
		deleteProductValidator,
		deleteProduct
	);

router.use('/:productId/reviews', reviewRoute);

module.exports = router;
