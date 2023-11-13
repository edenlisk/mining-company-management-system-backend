const express = require('express');
const {
    getAllCassiteriteEntries,
    createCassiteriteEntry,
    getOneCassiteriteEntry,
    deleteCassiteriteEntry,
    updateCassiteriteEntry,
    uploadGradeImg,
    trashEntries
} = require('../controllers/cassiteriteControllers');
const router = express.Router();

router.route('/')
    .get(getAllCassiteriteEntries)
    .post(createCassiteriteEntry)

router.route('/trash')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneCassiteriteEntry)
    .patch(uploadGradeImg.any(), updateCassiteriteEntry)
    .delete(deleteCassiteriteEntry)


module.exports = router;