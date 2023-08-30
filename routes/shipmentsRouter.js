const express = require('express');
const router = express.Router();
const {
    createShipment,
    getAllshipments,
    uploadCertificates,
    updateShipment,
    shipmentReport,
    getOneShipment
} = require('../controllers/shipmentControllers');


router.route('/')
    .get(getAllshipments)
    .post(createShipment)

router.route('/report/:shipmentId')
    .post(shipmentReport)

router.route('/:shipmentId')
    .get(getOneShipment)
    .patch(
        uploadCertificates.any(),
        updateShipment
    );


module.exports = router;