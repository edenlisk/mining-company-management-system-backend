const { Router } = require('express');
const { getAllLogs, getUserLogs } = require('../controllers/activityLogsControllers');

const router = Router();

router.route('/')
    .get(getAllLogs)

router.route('/:userId')
    .get(getUserLogs)

module.exports = router;
