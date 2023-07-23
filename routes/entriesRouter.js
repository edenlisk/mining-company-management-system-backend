const express = require('express');
const router = express.Router();
const { createEntry,
    deleteEntry,
    getOneEntry,
    updateEntry,
    getAllEntries } = require('../controllers/entryControllers');

router.route('/')
    .get(getAllEntries)
    .post(createEntry)

router.route('/:entryId')
    .get(getOneEntry)
    .patch(updateEntry)
    .delete(deleteEntry)


module.exports = router;