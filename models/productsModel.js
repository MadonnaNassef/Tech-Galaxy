const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [3, 'Product name is too short'],
		},
		slug: {
			type: String,
			require: true,
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, 'Product description is required'],
		},
		quantity: {
			type: Number,
			required: [true, 'Product quantity is required'],
		},
		sold: { type: Number, default: 0 },
		price: {
			type: Number,
			required: [true, 'Price is required'],
			trim: true,
		},
		priceAfterDiscount: {
			type: Number,
		},
		colors: [String],
		images: [String],
		coverImage: {
			type: String,
			// required: [true, 'Cover image must be provided for the product'],
		},
		category: {
			type: mongoose.Schema.ObjectId,
			ref: 'Category',
			required: [true, 'Product must belong to a Category'],
		},
		subCategory: {
			type: mongoose.Schema.ObjectId,
			ref: 'Subcategory',
			required: [true, 'Product must belong to a SubCategory'],
		},
		brand: {
			type: mongoose.Schema.ObjectId,
			ref: 'Brand',
			required: [true, 'Product must belong to a Brand'],
		},
		ratingsAverage: {
			type: Number,
			min: [1, 'Rating is not valid'],
			max: [5, 'Rating is not valid'],
		},
		ratingQuantity: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

// Mongoose Middleware
productSchema.pre(/^find/, function (next) {
	this.populate({ path: 'category', select: 'name -_id' });
	next();
});

const setImageURL = (doc) => {
	if (doc.coverImage) {
		const imageUrl = `${process.env.BASE_URL}/product/${doc.coverImage}`;
		doc.coverImage = imageUrl;
	}
	if (doc.images) {
		const imagesList = [];
		doc.images.forEach((image) => {
			const imageUrl = `${process.env.BASE_URL}/product/${image}`;
			imagesList.push(imageUrl);
		});
		doc.images = imagesList;
	}
};
// findOne, findAll and update
productSchema.post('init', (doc) => {
	setImageURL(doc);
});

// create
productSchema.post('save', (doc) => {
	setImageURL(doc);
});

const ProductModel = mongoose.model('Product', productSchema);

module.exports = ProductModel;
