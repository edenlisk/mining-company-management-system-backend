const express = require('express');
const {
    getAllColtanEntries,
    getOneColtanEntry,
    createColtanEntry,
    updateColtanEntry,
    deleteColtanEntry,
    uploadGradeImg,
    trashEntries,
    deleteGradeImg
} = require('../controllers/coltanControllers');
const router = express.Router();

router.route('/')
    .get(getAllColtanEntries)
    .post(createColtanEntry)

router.route('/trash')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneColtanEntry)
    .patch(uploadGradeImg.any(), updateColtanEntry)
    .delete(deleteColtanEntry)

router.route('/delete-grade-img/:entryId')
    .delete(deleteGradeImg)


module.exports = router;