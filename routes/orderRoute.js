const express = require('express');

const { authenticated, authorized } = require('../services/authService');
const {
	createCashOrder,
	filterOrdersForUser,
	getAllOrders,
	getSpecificOrder,
	updateStatus,
	updateDeliveryStatus,
} = require('../services/orderService');

const router = express.Router();

router
	.route('/')
	.get(
		authenticated,
		authorized('user', 'admin', 'manager'),
		filterOrdersForUser,
		getAllOrders
	);

router
	.route('/:id')
	.get(authenticated, authorized('user', 'admin', 'manager'), getSpecificOrder);

router
	.route('/:cartId')
	.post(authenticated, authorized('user'), createCashOrder);

router
	.route('/:id/paid')
	.put(authenticated, authorized('admin', 'manager'), updateStatus);

router
	.route('/:id/delivered')
	.put(authenticated, authorized('admin', 'manager'), updateDeliveryStatus);

module.exports = router;
