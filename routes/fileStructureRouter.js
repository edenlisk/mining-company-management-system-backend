const { Router } = require('express');
const router = Router();
const { getFileStructure } = require('../controllers/fileStructureControllers');



router.route('/')
    .get(getFileStructure)

module.exports = router;
