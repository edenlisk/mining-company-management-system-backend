const { Router } = require('express');

const { updateTag } = require('../controllers/tagsControllers');

const router = Router();


router.route('/:tagNumber')
    .patch(updateTag)


module.exports = router;