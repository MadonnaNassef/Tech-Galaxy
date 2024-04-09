const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');

const sharp = require('sharp');
const { v4: uniqueId } = require('uuid');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

// Upload single image
exports.uploadImage = uploadSingleImage('image');

// Manipulate Image
exports.resizeBrandImage = asyncHandler(async (req, res, next) => {
	const filename = `brand-${uniqueId()}-${Date.now()}.jpeg`;

	if (req.file) {
		await sharp(req.file.buffer)
			.resize(400, 400)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`uploads/brands/${filename}`);
	}

	// Save to DB
	req.body.image = filename;

	next();
});

// Create brand
// Post method, /api/brands
// Private access

exports.createBrand = factory.create(Brand);

// Update getBrand
// PUT /api/brands/:id
// Private
exports.updateBrand = factory.update(Brand);

// Delete Brand
// Delete /api/brands/:id
// Private
exports.deleteBrand = factory.delete(Brand);

// Get Brands
// Get /api/brands
// Public access
exports.getBrands = factory.getDocuments(Brand);

// Get specific getBrand by id
// GET /api/brands/:id
// Public Access

exports.getBrand = factory.getSpecificDoc(Brand);
