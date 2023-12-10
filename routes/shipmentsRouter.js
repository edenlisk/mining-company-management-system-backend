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
    shipmentQuarterReport,
    generateForwardNote,
} = require('../controllers/shipmentControllers');
const { protect, restrictTo } = require('../controllers/authControllers');


router.route('/')
    .get(protect, getAllshipments)
    .post(protect, createShipment)

router.route('/report/:shipmentId')
    .post(protect, shipmentReport)

router.route('/quarter-report')
    .post(protect, shipmentQuarterReport)

router.route('/tags/:shipmentId')
    .get(protect, tagList)
    .post(protect, generateTagList)

router.route('/negociant-tags/:shipmentId')
    .post(protect, generateNegociantTagList)

router.route('/packing-list/:shipmentId')
    .post(protect, generateICGLRPackingList)

router.route('/:shipmentId')
    .get(protect, getOneShipment)
    .patch(protect,
        uploadCertificates.any(),
        updateShipment
    );

router.route('/forward-note/:shipmentId')
    .post(generateForwardNote)


module.exports = router;