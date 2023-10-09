const express = require('express');
const { getAllInvoices, generateInvoice } = require('../controllers/invoiceControllers');
const router = express.Router();

router.route('/')
    .get(getAllInvoices)
    .post(generateInvoice)


module.exports = router;