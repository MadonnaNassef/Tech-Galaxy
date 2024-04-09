const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Username is required'],
		},
		slug: { type: String, lowercase: true },
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: [true, 'Email already used'],
			lowercase: true,
		},
		emailVerificationToken: String,
		emailVerificationExpiry: Date,
		emailVerified: Boolean,

		phone: String,
		profileImage: String,
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password is too short'],
		},
		passChangedAt: Date,
		passwordResetCode: String,
		passwordResetExpiry: Date,
		passwordResetVerified: Boolean,
		role: {
			type: String,
			enum: ['user', 'admin', 'manager'],
			default: 'user',
		},
		active: { type: Boolean, default: true },
	},
	{ timestamp: true }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	// Hashing
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
