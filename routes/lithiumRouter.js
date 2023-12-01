const express = require('express');
const {
    getAllLithiumEntries,
    getOneLithiumEntry,
    createLithiumEntry,
    updateLithiumEntry,
    deleteLithiumEntry,
    trashEntries
} = require('../controllers/lithiumControllers');

const { deleteGradeImg } = require('../controllers/coltanControllers');
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

router.route('/delete-grade-img/:model/:entryId')
    .delete(deleteGradeImg)


module.exports = router;