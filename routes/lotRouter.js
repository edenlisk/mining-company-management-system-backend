const { Router } = require('express');
const {protect} = require("../controllers/authControllers");
const lotController = require("../controllers/lotController");
const {uploadGradeImg} = require("../utils/helperFunctions");

const router = Router();

router.route('/')
    .post(protect, lotController.createAndUpdateLots)

router.route('/:lotId')
    .patch(protect, uploadGradeImg.any(), lotController.updateLot)
    .delete(protect, lotController.deleteLot)


module.exports = router;