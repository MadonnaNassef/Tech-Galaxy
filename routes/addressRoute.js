const express = require('express');

const router = express.Router();

const { authorized, authenticated } = require('../services/authService');

const {
	removeAddress,
	addAddress,
	getAddress,
	// updateAddress,
} = require('../services/addressService');

const {
	addAddressValidator,
} = require('../utils/validators/addressValidators');

router.use(authenticated, authorized('user'));

router.route('/').post(addAddressValidator, addAddress).get(getAddress);
router.route('/:addressId').delete(removeAddress);
// .put(updateAddress);

module.exports = router;
