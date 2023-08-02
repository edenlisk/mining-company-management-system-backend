const express = require('express');
const {
    getAllLithiumEntries,
    getOneLithiumEntry,
    createLithiumEntry,
    updateLithiumEntry,
    deleteLithiumEntry
} = require('../controllers/lithiumControllers');
const router = express.Router();

router.route('/')
    .get(getAllLithiumEntries)
    .post(createLithiumEntry)

router.route('/:entryId')
    .get(getOneLithiumEntry)
    .patch(updateLithiumEntry)
    .delete(deleteLithiumEntry)


module.exports = router;