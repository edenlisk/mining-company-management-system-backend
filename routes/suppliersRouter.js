const express = require('express');
const router = express.Router();
const { getAllSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getOneSupplier } = require('../controllers/supplierControllers');

router.route('/')
    .get(getAllSuppliers)
    .post(addSupplier)

router.route('/:supplierId')
    .get(getOneSupplier)
    .patch(updateSupplier)
    .delete(deleteSupplier)

module.exports = router;