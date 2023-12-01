const express = require('express');
const {
    getAllBerylliumEntries,
    getOneBerylliumEntry,
    createBerylliumEntry,
    deleteBerylliumEntry,
    updateBerylliumEntry,
    trashEntries
} = require('../controllers/berylliumControllers');
const { deleteGradeImg } = require('../controllers/coltanControllers');

const router = express.Router();

router.route('/')
    .get(getAllBerylliumEntries)
    .post(createBerylliumEntry)

router.route('/trash')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneBerylliumEntry)
    .patch(updateBerylliumEntry)
    .delete(deleteBerylliumEntry)

router.route('/delete-grade-img/:model/:entryId')
    .delete(deleteGradeImg)



module.exports = router;