const express = require('express');
const {
    getAllBerylliumEntries,
    getOneBerylliumEntry,
    createBerylliumEntry,
    deleteBerylliumEntry,
    updateBerylliumEntry
} = require('../controllers/berylliumControllers');
const router = express.Router();

router.route('/')
    .get(getAllBerylliumEntries)
    .post(createBerylliumEntry)

router.route('/:entryId')
    .get(getOneBerylliumEntry)
    .patch(updateBerylliumEntry)
    .delete(deleteBerylliumEntry)


module.exports = router;