const { validationResult } = require('express-validator');

const validorMiddleware = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ error: errors.array() });
	}
	next();
};

module.exports = validorMiddleware;
