const express = require('express');
const {
    getAllWolframiteEntries,
    getOneWolframiteEntry,
    createWolframiteEntry,
    deleteWolframiteEntry,
    updateWolframiteEntry
} = require('../controllers/wolframiteControllers');
const router = express.Router();

router.route('/')
    .get(getAllWolframiteEntries)
    .post(createWolframiteEntry)


router.route('/:entryId')
    .get(getOneWolframiteEntry)
    .patch(updateWolframiteEntry)
    .delete(deleteWolframiteEntry)


module.exports = router;