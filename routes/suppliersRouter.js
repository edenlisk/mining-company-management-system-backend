const express = require('express');
const router = express.Router();
const { generate } = require('../utils/docTemplater');
const {
    getAllSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getOneSupplier,
    supplierProductionHistory } = require('../controllers/supplierControllers');

router.route('/')
    .get(getAllSuppliers)
    .post(addSupplier)

router.route("/generate/:supplierId")
    .post(generate)

router.route('/:supplierId')
    .get(getOneSupplier)
    .patch(updateSupplier)
    .delete(deleteSupplier)

router.route('/history/:supplierId')
    .post(supplierProductionHistory)

module.exports = router;