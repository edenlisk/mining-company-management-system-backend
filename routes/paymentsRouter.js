const express = require('express');
const router = express.Router();
const { addPayment, getAllPayments, getOnePayment } = require('../controllers/paymentControllers');

router.route('/')
    .get(getAllPayments)
    .post(addPayment)

router.route('/:paymentId')
    .get(getOnePayment)

module.exports = router;