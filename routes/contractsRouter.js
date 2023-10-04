const express = require('express');
const {
    createContract,
    getAllContracts,
    uploadContract,
    updateContract,
    deleteContract,
    downloadContract,
    getBuyerContracts } = require('../controllers/contractControllers');
const router = express.Router();

router.route('/')
    .get(getAllContracts)
    .post(uploadContract, createContract)


router.route('/:buyerId')
    .get(getBuyerContracts)

router.route('/:contractId')
    .post(downloadContract)
    .patch(uploadContract, updateContract)
    .delete(deleteContract)


module.exports = router;