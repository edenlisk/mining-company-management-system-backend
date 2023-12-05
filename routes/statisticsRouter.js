const {Router} = require('express');
const {
    detailedStock,
    paymentHistory,
    stockSummary,
    lastCreatedEntries,
    currentStock,
    topSuppliers,
    unsettledLots, generateReconciliationExcelTable
} = require('../controllers/statisticsControllers');
const router = Router();

router.route('/details/:model')
    .get(detailedStock)

router.route('/payment-history/:model/:entryId/:lotNumber')
    .get(paymentHistory)

router.route('/stock-summary')
    .get(stockSummary)

router.route('/current-stock')
    .get(currentStock)

router.route('/last-created')
    .get(lastCreatedEntries)

router.route('/top-suppliers')
    .get(topSuppliers)

router.route('/unpaid-lots/:supplierId')
    .get(unsettledLots)

router.route('/reconciliations/:model')
    .post(generateReconciliationExcelTable)

module.exports = router;