const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const Product = require('../models/productsModel');
const factory = require('./handlersFactory');

// const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');

// const multer = require('multer');
const sharp = require('sharp');
const { v4: uniqueId } = require('uuid');

exports.uploadProductImages = uploadMixOfImages([
	{
		name: 'coverImage',
		maxCount: 1,
	},
	{
		name: 'images',
		maxCount: 5,
	},
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
	// console.log(req.files);
	//1- Image processing for coverImage
	if (req.files.coverImage) {
		const coverImageFileName = `product-${uniqueId()}-${Date.now()}-cover.jpeg`;

		await sharp(req.files.coverImage[0].buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 95 })
			.toFile(`uploads/products/${coverImageFileName}`);

		// Save image into our db
		req.body.coverImage = coverImageFileName;
	}
	//2- Image processing for images
	if (req.files.images) {
		req.body.images = [];
		await Promise.all(
			req.files.images.map(async (img, index) => {
				const imageName = `product-${uniqueId()}-${Date.now()}-${index + 1}.jpeg`;

				await sharp(img.buffer)
					.resize(2000, 1333)
					.toFormat('jpeg')
					.jpeg({ quality: 95 })
					.toFile(`uploads/products/${imageName}`);

				// Save image into our db
				req.body.images.push(imageName);
			})
		);

		next();
	}
});

// Create product
// Post method, /api/product
// Private access
exports.createProduct = factory.create(Product);

// Update Product
// PUT /api/product/:id
// Private
exports.updateProduct = factory.update(Product);

// Delete Product
// Delete /api/product/:id
// Private
exports.deleteProduct = factory.delete(Product);

// Get Products
// Get /api/product
// Public access
exports.getProducts = factory.getDocuments(Product, 'Product');

// Get specific Product by id
// GET /api/product/:id
// Public Access

exports.getProduct = factory.getSpecificDoc(Product);
