const express = require('express');
const router = express.Router();
const {
    createShipment,
    getAllshipments,
    uploadCertificates,
    updateShipment,
    shipmentReport,
    getOneShipment,
    tagList,
    generateTagList,
    generateNegociantTagList,
    generateICGLRPackingList,
    shipmentQuarterReport
} = require('../controllers/shipmentControllers');


router.route('/')
    .get(getAllshipments)
    .post(createShipment)

router.route('/report/:shipmentId')
    .post(shipmentReport)

router.route('/quarter-report')
    .post(shipmentQuarterReport)

router.route('/tags/:shipmentId')
    .get(tagList)
    .post(generateTagList)

router.route('/negociant-tags/:shipmentId')
    .post(generateNegociantTagList)

router.route('/packing-list/:shipmentId')
    .post(generateICGLRPackingList)

router.route('/:shipmentId')
    .get(getOneShipment)
    .patch(
        uploadCertificates.any(),
        updateShipment
    );


module.exports = router;