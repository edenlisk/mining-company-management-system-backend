const { Router } = require('express');

const { updateTag, getAllTags, createTag, getSupplierTags } = require('../controllers/tagsControllers');

const router = Router();

router.route('/')
    .get(getAllTags)
    .post(createTag)

router.route('/:tagNumber')
    .patch(updateTag)

router.route('/supplier/:supplierId')
    .get(getSupplierTags)

module.exports = router;