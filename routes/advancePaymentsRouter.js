const {Router} = require('express');
const {
    addAdvancePayment,
    getAllAdvancePayments,
    getOneAdvancePayment
} = require('../controllers/advancePaymentControllers');
const router = Router();

router.route('/')
    .get(getAllAdvancePayments)
    .post(addAdvancePayment)

router.route('/paymentId')
    .get(getOneAdvancePayment)


module.exports = router;