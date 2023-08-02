const {Router} = require('express');
const {createMixedEntry} = require('../controllers/mixedControllers');
const router = Router();

router.route('/')
    .post(createMixedEntry)

module.exports = router;