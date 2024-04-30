const express = require('express');
const router = express.Router();
const { createEntry,
    deleteEntry,
    getOneEntry,
    updateEntry,
    getAllEntries } = require('../controllers/entryControllers');
const { protect } = require('../controllers/authControllers');

router.route('/')
    .get(protect, getAllEntries)

router.route('/:model')
    .post(protect, createEntry)

router.route('/:model/:entryId')
    .get(protect, getOneEntry)
    .patch(protect, updateEntry)
    .delete(protect, deleteEntry)


module.exports = router;