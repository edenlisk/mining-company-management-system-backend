const LotShipment = require('../models/lotShipmentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Controller for LotShipment operations
const lotShipmentController = {

    createLotShipment: catchAsync(async (req, res, next) => {
        const { shipment, weight, lotId } = req.body;
        const newLotShipment = new LotShipment({
            shipment,
            weight,
            lotId,
        });
        const savedLotShipment = await newLotShipment.save();
        res.status(201).json({
            success: true,
            data: savedLotShipment
        });
    }),

    createManyLotShipments: catchAsync(async (req, res, next) => {
        const { shipments } = req.body;
        const inserted = await LotShipment.insertMany(shipments);
        if (!inserted.insertedCount) return next(new AppError("Unable to insert lot shipments", 400));
        res
            .status(201)
            .json({
                success: true,
                data: inserted.insertedCount
            })
        ;
    }),


    createAndUpdateLotShipment: catchAsync(async (req, res, next) => {
        const {entries} = req.body;
        if (entries?.length) {
            // const Entry = getModel(shipment.model);
            for (const item of req.body.entries) {
                // const entry = await Entry.findById(item.entryId);
                // if (!entry) continue;
                // const lot = entry.output?.find(value => parseInt(value.lotNumber) === parseInt(item.lotNumber));
                // if (!lot || !entry) return next(new AppError("Something went wrong, lot is missing", 400));
                if (item._id) {
                    const lotShipment = await LotShipment.findById(item._id);
                    if (lotShipment) {
                        if (lotShipment.weight !== item.weight) lotShipment.weight = item.weight;
                    }
                } else {
                    await LotShipment.create(
                        {
                            weight: item.weight,
                            lotId: item.lotId,
                            shipment: item.shipment
                        }
                    )
                }
                // if (lotShipment) {
                //     if (item)
                //     if (parseInt(item[shipment.shipmentNumber]) === 0) {
                //         lot.shipmentHistory = lot.shipmentHistory.filter(value => value.shipmentNumber !== shipment.shipmentNumber);
                //         shipment.entries = shipment.entries.filter(value => (value.entryId !== new mongoose.Types.ObjectId(item.entryId)) && (parseInt(value.lotNumber) !== parseInt(item.lotNumber)));
                //     } else {
                //         const shipmentEntry = shipment.entries.find(value => (value.entryId.equals(item.entryId)) && (parseInt(value.lotNumber) === parseInt(item.lotNumber)));
                //         if (!shipmentEntry) continue;
                //         shipmentEntry.quantity = item[shipment.shipmentNumber];
                //         lotShipment.weight = item[shipment.shipmentNumber];
                //     }
                // } else {
                //     if (parseInt(item[shipment.shipmentNumber]) === 0) continue;
                //     lot.shipmentHistory.push({shipmentNumber: shipment.shipmentNumber, weight: item[shipment.shipmentNumber], date: new Date()});
                //     shipment.entries.push({entryId: item.entryId, lotNumber: parseInt(item.lotNumber), quantity: item[shipment.shipmentNumber]});
                // }
                // await entry.save({validateModifiedOnly: true});
            }
        }
        res
            .status(201)
            .json(
                {
                    success: true
                }
            )
    }),

    // Get all lot shipments
    getAllLotShipments: async (req, res) => {
        try {
            const lotShipments = await LotShipment.find()
                .populate('shipment')
                .populate('lotId');

            res.status(200).json({
                success: true,
                count: lotShipments.length,
                data: lotShipments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get a single lot shipment by ID
    getLotShipmentById: async (req, res) => {
        try {
            const lotShipment = await LotShipment.findById(req.params.id)
                .populate('shipment')
                .populate('lotId');

            if (!lotShipment) {
                return res.status(404).json({
                    success: false,
                    message: 'Lot shipment not found'
                });
            }

            res.status(200).json({
                success: true,
                data: lotShipment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update a lot shipment
    updateLotShipment: async (req, res) => {
        try {
            const { shipment, weight, lotId, date } = req.body;

            const lotShipment = await LotShipment.findById(req.params.id);

            if (!lotShipment) {
                return res.status(404).json({
                    success: false,
                    message: 'Lot shipment not found'
                });
            }

            // Update fields if provided
            if (shipment) lotShipment.shipment = shipment;
            if (weight !== undefined) lotShipment.weight = weight;
            if (lotId) lotShipment.lotId = lotId;
            if (date) lotShipment.date = date;

            const updatedLotShipment = await lotShipment.save();

            res.status(200).json({
                success: true,
                data: updatedLotShipment
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete a lot shipment
    deleteLotShipment: async (req, res) => {
        try {
            const lotShipment = await LotShipment.findById(req.params.id);

            if (!lotShipment) {
                return res.status(404).json({
                    success: false,
                    message: 'Lot shipment not found'
                });
            }

            await lotShipment.deleteOne();

            res.status(200).json({
                success: true,
                message: 'Lot shipment deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get lot shipments by shipment ID
    getLotShipmentsByShipment: async (req, res) => {
        try {
            const lotShipments = await LotShipment.find({ shipment: req.params.shipmentId })
                .populate('lotId');

            res.status(200).json({
                success: true,
                count: lotShipments.length,
                data: lotShipments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get lot shipments by lot ID
    getLotShipmentsByLot: async (req, res) => {
        try {
            const lotShipments = await LotShipment.find({ lotId: req.params.lotId })
                .populate('shipment');

            res.status(200).json({
                success: true,
                count: lotShipments.length,
                data: lotShipments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get lot shipments by date range
    getLotShipmentsByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide both start and end dates'
                });
            }

            const lotShipments = await LotShipment.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
                .populate('shipment')
                .populate('lotId');

            res.status(200).json({
                success: true,
                count: lotShipments.length,
                data: lotShipments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get total weight of all lot shipments
    getTotalWeight: async (req, res) => {
        try {
            const result = await LotShipment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalWeight: { $sum: '$weight' }
                    }
                }
            ]);

            const totalWeight = result.length > 0 ? result[0].totalWeight : 0;

            res.status(200).json({
                success: true,
                totalWeight
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = lotShipmentController;