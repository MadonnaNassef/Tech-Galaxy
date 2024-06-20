const mongoose = require('mongoose');
const Product = require('./productsModel');
const { autoGenerateCoupon } = require('../services/couponService');

const reviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
		},
		ratings: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			required: [true, 'Rating is required'],
		},
		gamingRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		workRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		videoRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		soundRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		dependabilityRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		cameraRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		batteryRating: {
			type: Number,
			min: [1, 'Minimum rating is 1 star'],
			max: [5, 'Maximum rating is 5 stars'],
			// required: [true, 'Rating is required'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a User'],
		},
		product: {
			type: mongoose.Schema.ObjectId,
			ref: 'Product',
			required: [true, 'Review must belong to a Product'],
		},
	},
	{ timestamps: true }
);

// Mongoose Middleware
reviewSchema.pre(/^find/, function (next) {
	this.populate({ path: 'user', select: 'name' });
	next();
});

reviewSchema.statics.calcAverageRatingAndQuantity = async function (productId) {
	const statics = await this.aggregate([
		// Match
		{ $match: { product: productId } },
		// Group reviews based on productId  then calculate avg rating and quantity
		{
			$group: {
				_id: 'product',
				avgRatings: { $avg: '$ratings' },
				avgGaming: { $avg: '$gamingRating' },
				avgWork: { $avg: '$workRating' },
				avgVideo: { $avg: '$videoRating' },
				avgSound: { $avg: '$soundRating' },
				avgDependability: { $avg: '$dependabilityRating' },
				avgCamera: { $avg: '$cameraRating' },
				avgBattery: { $avg: '$batteryRating' },
				ratingsQuantity: { $sum: 1 },
			},
		},
	]);

	if (statics.length > 0) {
		await Product.findByIdAndUpdate(productId, {
			ratingsAverage: statics[0].avgRatings,
			gamingAverage: statics[0].avgGaming,
			workAverage: statics[0].avgWork,
			videoAverage: statics[0].avgVideo,
			soundAverage: statics[0].avgSound,
			dependabilityAverage: statics[0].avgDependability,
			cameraAverage: statics[0].avgCamera,
			batteryAverage: statics[0].avgBattery,
			ratingQuantity: statics[0].ratingsQuantity,
		});
	} else {
		await Product.findByIdAndUpdate(productId, {
			ratingsAverage: 0,
			gamingAverage: 0,
			workAverage: 0,
			videoAverage: 0,
			dependabilityAverage: 0,
			cameraAverage: 0,
			batteryAverage: 0,
			ratingQuantity: 0,
		});
	}
};

reviewSchema.post('save', async function () {
	await this.constructor.calcAverageRatingAndQuantity(this.product);
});

// expiress after a month of creation date
const calculateExpiryDate = () => {
	const currentDate = new Date();
	// Add one month to the current date
	const expiryDate = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		currentDate.getDate()
	);
	return expiryDate;
};

reviewSchema.post('save', async function () {
	// Assuming this.user is the user who wrote the review
	if (this.title && this.ratings) {
		const expiry = calculateExpiryDate();
		const coupon = await autoGenerateCoupon(this.user, 10, expiry);
		return coupon;
	}
});

reviewSchema.post('findOneAndDelete', async (doc) => {
	await doc.constructor.calcAverageRatingAndQuantity(doc.product);
});

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
