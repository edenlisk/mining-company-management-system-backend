const { Router } = require('express');
const router = Router();
const { getFileStructure, downloadFile } = require('../controllers/fileStructureControllers');



router.route('/')
    .get(getFileStructure)

router.route('/download')
    .post(downloadFile)

module.exports = router;
