const { Router } = require('express');
const { detailedStock } = require('../controllers/statisticsControllers');
const router = Router();

router.route('/details/:model')
    .get(detailedStock)

module.exports = router;