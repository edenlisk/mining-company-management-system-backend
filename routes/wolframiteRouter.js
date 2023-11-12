const express = require('express');
const {
    getAllWolframiteEntries,
    getOneWolframiteEntry,
    createWolframiteEntry,
    deleteWolframiteEntry,
    updateWolframiteEntry,
    uploadGradeImg,
    trashEntries
} = require('../controllers/wolframiteControllers');
const { deleteGradeImg } = require('../controllers/coltanControllers');

const router = express.Router();

router.route('/')
    .get(getAllWolframiteEntries)
    .post(createWolframiteEntry)

router.route('/trash')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneWolframiteEntry)
    .patch(uploadGradeImg.any(), updateWolframiteEntry)
    .delete(deleteWolframiteEntry)

router.route('/delete-grade-img/:model/:entryId')
    .delete(deleteGradeImg)

module.exports = router;