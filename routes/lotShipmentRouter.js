const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const lotShipmentController = require('../controllers/lotShipmentController');
const {protect} = require("../controllers/authControllers");

// Middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Create a new lot shipment
// router.route('/').post(
//     [
//         body('shipment')
//             .notEmpty()
//             .withMessage('Shipment ID is required')
//             .isMongoId()
//             .withMessage('Invalid shipment ID format'),
//         body('weight')
//             .notEmpty()
//             .withMessage('Weight is required')
//             .isNumeric()
//             .withMessage('Weight must be a number'),
//         body('lotId')
//             .notEmpty()
//             .withMessage('Lot ID is required')
//             .isMongoId()
//             .withMessage('Invalid lot ID format')
//     ],
//     validate,
//     lotShipmentController.createLotShipment
// );

router.route('/')
    .post(protect, lotShipmentController.createManyLotShipments)

// Get all lot shipments
router.get('/', lotShipmentController.getAllLotShipments);

// Get a single lot shipment by ID
router.route('/:id').get(
    [
        param('id')
            .isMongoId()
            .withMessage('Invalid lot shipment ID format')
    ],
    validate,
    lotShipmentController.getLotShipmentById
);

router.route('/create-update')
    .post(lotShipmentController.createAndUpdateLotShipment)

// Update a lot shipment
router.route('/:id').patch(
    [
        param('id')
            .isMongoId()
            .withMessage('Invalid lot shipment ID format'),
        body('shipment')
            .optional()
            .isMongoId()
            .withMessage('Invalid shipment ID format'),
        body('weight')
            .optional()
            .isNumeric()
            .withMessage('Weight must be a number'),
        body('lotId')
            .optional()
            .isMongoId()
            .withMessage('Invalid lot ID format'),
        body('date')
            .optional()
            .isISO8601()
            .withMessage('Date must be in ISO 8601 format')
    ],
    validate,
    lotShipmentController.updateLotShipment
);

// Delete a lot shipment
router.delete(
    '/:id',
    [
        param('id')
            .isMongoId()
            .withMessage('Invalid lot shipment ID format')
    ],
    validate,
    lotShipmentController.deleteLotShipment
);

// Get lot shipments by shipment ID
router.get(
    '/shipment/:shipmentId',
    [
        param('shipmentId')
            .isMongoId()
            .withMessage('Invalid shipment ID format')
    ],
    validate,
    lotShipmentController.getLotShipmentsByShipment
);

// Get lot shipments by lot ID
router.get(
    '/lot/:lotId',
    [
        param('lotId')
            .isMongoId()
            .withMessage('Invalid lot ID format')
    ],
    validate,
    lotShipmentController.getLotShipmentsByLot
);

// Get lot shipments by date range
router.get(
    '/date-range',
    [
        query('startDate')
            .notEmpty()
            .withMessage('Start date is required')
            .isISO8601()
            .withMessage('Start date must be in ISO 8601 format'),
        query('endDate')
            .notEmpty()
            .withMessage('End date is required')
            .isISO8601()
            .withMessage('End date must be in ISO 8601 format')
    ],
    validate,
    lotShipmentController.getLotShipmentsByDateRange
);

// Get total weight of all lot shipments
router.get('/stats/total-weight', lotShipmentController.getTotalWeight);

module.exports = router;