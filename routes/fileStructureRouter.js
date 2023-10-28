const { Router } = require('express');
const router = Router();
const { getFileStructure, downloadFile } = require('../controllers/fileStructureControllers');



router.route('/')
    .get(getFileStructure)

router.route('/download')
    .get(downloadFile)

module.exports = router;
