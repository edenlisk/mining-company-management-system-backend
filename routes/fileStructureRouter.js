const { Router } = require('express');
const router = Router();
const { getFileStructure, downloadFile } = require('../controllers/fileStructureControllers');



router.route('/')
    .get(getFileStructure)
    .post(downloadFile)

module.exports = router;
