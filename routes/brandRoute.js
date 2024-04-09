const express = require('express');

const {
	getBrandValidator,
	updateBrandValidator,
	deleteBrandValidator,
	createBrandValidator,
} = require('../utils/validators/brandValidators');

const router = express.Router();

const {
	getBrands,
	getBrand,
	createBrand,
	updateBrand,
	deleteBrand,
	uploadImage,
	resizeBrandImage,
} = require('../services/brandService');

const { authenticated, authorized } = require('../services/authService');

router
	.route('/')
	.get(getBrands)
	.post(
		authenticated,
		authorized('admin', 'manager'),
		uploadImage,
		resizeBrandImage,
		createBrandValidator,
		createBrand
	);
router
	.route('/:id')
	.get(getBrandValidator, getBrand)
	.put(
		authenticated,
		authorized('admin', 'manager'),
		uploadImage,
		resizeBrandImage,
		updateBrandValidator,
		updateBrand
	)
	.delete(
		authenticated,
		authorized('admin'),
		deleteBrandValidator,
		deleteBrand
	);

module.exports = router;
