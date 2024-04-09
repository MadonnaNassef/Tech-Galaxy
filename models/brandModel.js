const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Brand required'],
			unique: [true, 'Brand must be unique'],
			minlength: [3, 'Brand name is too short'],
			maxlength: [32, 'Brand name is too long'],
		},
		slug: {
			type: String,
			lowercase: true,
		},
		image: String,
	},
	{ timestamps: true }
);

const setImageUrl = (doc) => {
	// Return image bae url + image name
	if (doc.image) {
		const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
		doc.image = imageUrl;
	}
};

// Get/Update brand
brandSchema.post('init', (doc) => {
	setImageUrl(doc);
});

// Create brand
brandSchema.post('save', (doc) => {
	setImageUrl(doc);
});

const BrandModel = mongoose.model('Brand', brandSchema);

module.exports = BrandModel;
