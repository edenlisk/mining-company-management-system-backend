const {Router} = require('express');
const {
    detailedStock,
    paymentHistory,
    stockSummary,
    lastCreatedEntries,
    topSuppliers, unsettledLots
} = require('../controllers/statisticsControllers');
const router = Router();

router.route('/details/:model')
    .get(detailedStock)

router.route('/payment-history/:model/:entryId/:lotNumber')
    .get(paymentHistory)

router.route('/stock-summary')
    .get(stockSummary)

router.route('/last-created')
    .get(lastCreatedEntries)

router.route('/top-suppliers')
    .get(topSuppliers)

router.route('/unpaid-lots/:supplierId/:model/')
    .get(unsettledLots)

module.exports = router;