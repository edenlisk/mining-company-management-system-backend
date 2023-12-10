const express = require('express');
const router = express.Router();
const { addPayment, getAllPayments, getOnePayment } = require('../controllers/paymentControllers');
const { protect, restrictTo } = require('../controllers/authControllers');

router.route('/')
    .get(protect, getAllPayments)
    .post(protect, addPayment)

router.route('/:paymentId')
    .get(protect, getOnePayment)

module.exports = router;