const express = require('express');
const router = express.Router();
const { getAllDueDiligenceDocuments,
    uploadDueDiligence,
    addDueDiligenceDocument,
    deleteDiligence,
    downloadDueDiligenceDocument,
    updateDiligence } = require('../controllers/dueDiligenceControllers');
const {protect} = require("../controllers/authControllers");

router.route('/')
    .get(protect, getAllDueDiligenceDocuments)
    .post(protect, uploadDueDiligence, addDueDiligenceDocument)

router.route('/:documentId')
    .post(protect, downloadDueDiligenceDocument)
    .patch(protect, uploadDueDiligence, updateDiligence)
    .delete(protect, deleteDiligence)

module.exports = router;