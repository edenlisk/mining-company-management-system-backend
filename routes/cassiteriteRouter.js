const express = require('express');
const {
    getAllCassiteriteEntries,
    createCassiteriteEntry,
    getOneCassiteriteEntry,
    deleteCassiteriteEntry,
    updateCassiteriteEntry
} = require('../controllers/cassiteriteControllers');
const router = express.Router();

router.route('/')
    .get(getAllCassiteriteEntries)
    .post(createCassiteriteEntry)

router.route('/:entryId')
    .get(getOneCassiteriteEntry)
    .patch(updateCassiteriteEntry)
    .delete(deleteCassiteriteEntry)


module.exports = router;