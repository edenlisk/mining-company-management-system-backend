const {Router} = require('express');
const {
    addAdvancePayment,
    getAllAdvancePayments,
    getOneAdvancePayment,
    uploadContract
} = require('../controllers/advancePaymentControllers');
const router = Router();

router.route('/')
    .get(getAllAdvancePayments)
    .post(uploadContract.single("advancePaymentContract"), addAdvancePayment)

router.route('/paymentId')
    .get(getOneAdvancePayment)


module.exports = router;