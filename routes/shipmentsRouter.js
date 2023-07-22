const express = require('express');
const router = express.Router();
const { createShipment, getAllshipments, uploadCertificates, updateShipment } = require('../controllers/shipmentControllers');


router.route('/')
    .get(getAllshipments)
    .post(createShipment)

// router.route('/upload/analysis-certificate')
//     .post(uploadCertificates.single('analysisCertificate'), updateShipment)
//
// router.route('/upload/container-forward-note')
//     .post(uploadCertificates.single('containerForwardNote'), updateShipment)
//
// router.route('/upload/certificate-of-origin')
//     .post(uploadCertificates.single('certificateOfOrigin'), updateShipment)
//
// router.route('/upload/rmb-icglr-certificate')
//     .post(uploadCertificates.single('rmbIcglrCertificate'), updateShipment)


module.exports = router;