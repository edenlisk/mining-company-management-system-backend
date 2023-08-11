const express = require('express');
const {
    getAllWolframiteEntries,
    getOneWolframiteEntry,
    createWolframiteEntry,
    deleteWolframiteEntry,
    updateWolframiteEntry
} = require('../controllers/wolframiteControllers');
const { detailedStock } = require('../controllers/statisticsControllers');
const router = express.Router();

router.route('/')
    .get(getAllWolframiteEntries)
    .post(createWolframiteEntry)

router.route('/details/:model')
    .get(detailedStock)

router.route('/:entryId')
    .get(getOneWolframiteEntry)
    .patch(updateWolframiteEntry)
    .delete(deleteWolframiteEntry)


module.exports = router;