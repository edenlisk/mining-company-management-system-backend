const {Router} = require('express');
const {addSetting, updateSettings, getSettings} = require('../controllers/settingsControllers');
const router = Router();

router.route('/')
    .get(getSettings)
    .post(addSetting)
    .patch(updateSettings)


module.exports = router;