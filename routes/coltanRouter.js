const express = require('express');
const {
    getAllColtanEntries,
    getOneColtanEntry,
    createColtanEntry,
    updateColtanEntry,
    deleteColtanEntry
} = require('../controllers/coltanControllers');
const { detailedStock } = require('../controllers/statisticsControllers');
const router = express.Router();

router.route('/')
    .get(getAllColtanEntries)
    .post(createColtanEntry)

router.route('/details/:model')
    .get(detailedStock)

router.route('/:entryId')
    .get(getOneColtanEntry)
    .patch(updateColtanEntry)
    .delete(deleteColtanEntry)


module.exports = router;