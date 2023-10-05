const express = require('express');
const {
    getAllWolframiteEntries,
    getOneWolframiteEntry,
    createWolframiteEntry,
    deleteWolframiteEntry,
    updateWolframiteEntry,
    trashEntries
} = require('../controllers/wolframiteControllers');
const router = express.Router();

router.route('/')
    .get(getAllWolframiteEntries)
    .post(createWolframiteEntry)

router.route('/trash')
    .get(trashEntries)

router.route('/:entryId')
    .get(getOneWolframiteEntry)
    .patch(updateWolframiteEntry)
    .delete(deleteWolframiteEntry)


module.exports = router;