const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptions = () => {
	const multerStorage = multer.memoryStorage();

	// Make sure file type is image
	const multerFilter = function (req, file, cb) {
		if (file.mimetype.startsWith('image')) {
			cb(null, true);
		} else {
			cb(new ApiError('Only Images are allowed', 400), false);
		}
	};

	// Upload Image
	const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

	return upload;
};

exports.uploadSingleImage = (fileName) => multerOptions().single(fileName);

exports.uploadMixOfImages = (arrayOfFields) =>
	multerOptions().fields(arrayOfFields);

//disc storage images

// const multerStorage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, 'uploads/brands');
// 	},
// 	filename: function (req, file, cb) {
// 		const ext = file.mimetype.split('/')[1];
// 		const fileName = `brand-${uniqueId()}-${Date.now()}.${ext}`;
// 		cb(null, fileName);
// 	},
// });
