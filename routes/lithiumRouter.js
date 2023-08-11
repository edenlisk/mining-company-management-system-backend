const express = require('express');
const {
    getAllLithiumEntries,
    getOneLithiumEntry,
    createLithiumEntry,
    updateLithiumEntry,
    deleteLithiumEntry
} = require('../controllers/lithiumControllers');
const { detailedStock } = require('../controllers/statisticsControllers');
const router = express.Router();

router.route('/')
    .get(getAllLithiumEntries)
    .post(createLithiumEntry)

router.route('/details/:model')
    .get(detailedStock)

router.route('/:entryId')
    .get(getOneLithiumEntry)
    .patch(updateLithiumEntry)
    .delete(deleteLithiumEntry)


module.exports = router;