const { Router } = require('express');
const { getAllEditRequests, getOneEditRequest, createEditRequest, updateEditRequest } = require('../controllers/editPermissionControllers');
const router = Router();

router.route('/')
    .get(getAllEditRequests)
    .post(createEditRequest)

router.route('/:requestId')
    .get(getOneEditRequest)
    .patch(updateEditRequest)


module.exports = router;