const {Router} = require('express');
const {
    addAdvancePayment,
    getAllAdvancePayments,
    getOneAdvancePayment,
    uploadContract
} = require('../controllers/advancePaymentControllers');
const {protect, restrictTo} = require('../controllers/authControllers');
const router = Router();

router.route('/')
    .get(protect, getAllAdvancePayments)
    .post(protect, uploadContract.single("advancePaymentContract"), addAdvancePayment)

router.route('/paymentId')
    .get(protect, getOneAdvancePayment)


module.exports = router;