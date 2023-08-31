const { Router } = require('express');
const { detailedStock, paymentHistory } = require('../controllers/statisticsControllers');
const router = Router();

router.route('/details/:model')
    .get(detailedStock)

router.route('/payment-history/:model/:entryId/:lotNumber')
    .get(paymentHistory)

module.exports = router;