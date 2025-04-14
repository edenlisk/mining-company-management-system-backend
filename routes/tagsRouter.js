const { Router } = require('express');
const { updateTag, getAllTags, createTag, getSupplierTags, createAndUpdateTags, deleteTag} = require('../controllers/tagsControllers');
const { protect, restrictTo } = require('../controllers/authControllers');

const router = Router();

router.route('/')
    .get(protect, getAllTags)
    .post(protect, createTag)

router.route('/create-update')
    .post(protect, createAndUpdateTags)

router.route('/:tagNumber')
    .patch(protect, updateTag)
    .delete(protect, deleteTag)

router.route('/supplier/:supplierId')
    .get(protect, getSupplierTags)

module.exports = router;