const express = require('express');
const {
    getAllInvoices,
    generateInvoice,
    getSuppliersInvoice,
    getInvoice,
    updateInvoice
} = require('../controllers/invoiceControllers');
const router = express.Router();

router.route('/')
    .get(getAllInvoices)
    .post(generateInvoice)

router.route('/supplier/:supplierId')
    .get(getSuppliersInvoice)

router.route('/:invoiceId')
    .get(getInvoice)
    .patch(updateInvoice)


module.exports = router;