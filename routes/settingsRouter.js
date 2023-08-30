const {Router} = require('express');
const {addSetting, updateSettings} = require('../controllers/settingsControllers');
const router = Router();

router.route('/')
    .post(addSetting)
    .patch(updateSettings)


module.exports = router;