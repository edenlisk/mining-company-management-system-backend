const express = require('express');
const { getAllBuyers, createBuyer, getOneBuyer, deleteBuyer, updateBuyer } = require('../controllers/buyerControllers');
const router = express.Router();



router.route('/')
    .get(getAllBuyers)
    .post(createBuyer)

router.route('/:buyerId')
    .get(getOneBuyer)
    .patch(updateBuyer)
    .delete(deleteBuyer)

module.exports = router;