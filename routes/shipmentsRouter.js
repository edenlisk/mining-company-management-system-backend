const express = require('express');
const router = express.Router();
const {
    createShipment,
    getAllshipments,
    uploadCertificates,
    updateShipment,
    shipmentReport
} = require('../controllers/shipmentControllers');


router.route('/')
    .get(getAllshipments)
    .post(createShipment)

router.route('/report/:shipmentId')
    .post(shipmentReport)

router.route('/:shipmentId')
    .patch(
        uploadCertificates.any(),
        updateShipment
    );


module.exports = router;