const express = require('express');
const {
    getAllLithiumEntries,
    getOneLithiumEntry,
    createLithiumEntry,
    updateLithiumEntry,
    deleteLithiumEntry,
    trashEntries
} = require('../controllers/lithiumControllers');
const router = express.Router();

router.route('/')
    .get(getAllLithiumEntries)
    .post(createLithiumEntry)

router.route('/')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneLithiumEntry)
    .patch(updateLithiumEntry)
    .delete(deleteLithiumEntry)


module.exports = router;