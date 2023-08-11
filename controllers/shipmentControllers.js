const multer = require('multer');
const path = require('path');
const Shipment = require('../models/shipmentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { multerFilter, multerStorage } = require('../utils/helperFunctions');


exports.getAllshipments = catchAsync(async (req, res, next) => {
    const shipments = await Shipment.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    shipments
                }
            }
        )
    ;
})

exports.createShipment = catchAsync(async (req, res, next) => {
    await Shipment.create(
        {
            entries: req.body.entry,
            shipmentPrice: req.body.shipmentPrice,
            shipmentGrade: req.body.shipmentGrade,
            totalShipmentQuantity: req.body.totalShipmentQuantity,
            buyerId: req.body.buyerId,
            shipmentSamplingDate: req.body.shipmentSamplingDate,
            shipmentContainerLoadingDate: req.body.shipmentContainerLoadingDate,
            averageGrade: req.body.averageGrade,
            averagePrice: req.body.averagePrice,
            model: req.body.model
        }
    )
    res
        .status(201)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.addCertificate = catchAsync(async (req, res, next) => {
    // if (req.file && req.targetField) {
    //     shipment[req.targetField] = req.file.filename;
    // }
})

exports.updateShipment = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) return next(new AppError("Selected shipment no longer exists!", 400));
    if (req.body.entry) shipment.entries = req.body.entry;
    if (req.body.shipmentGrade) shipment.shipmentGrade = req.body.shipmentGrade;
    if (req.body.shipmentPrice) shipment.shipmentPrice = req.body.shipmentPrice;
    if (req.body.shipmentNumber) shipment.shipmentNumber = req.body.shipmentNumber;
    if (req.body.shipmentSamplingDate) shipment.shipmentSamplingDate = req.body.shipmentSamplingDate;
    if (req.body.shipmentContainerLoadingDate) shipment.shipmentContainerLoadingDate = req.body.shipmentContainerLoadingDate;
    if (req.body.totalShipmentQuantity) shipment.totalShipmentQuantity = req.body.totalShipmentQuantity;
    if (req.body.averageGrade) shipment.averageGrade = req.body.averageGrade;
    if (req.body.averagePrice) shipment.averagePrice = req.body.averagePrice;
    await shipment.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.deleteShipment = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
    if (!shipment) return next(new AppError("Selected shipment no longer exists!", 400));
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})


// const multerStorage = multer.diskStorage(
//     {
//         destination: function (req, file, cb) {
//             cb(null, 'public/data/shipment/');
//         },
//         filename: function (req, file, cb) {
//             cb(null, file.originalname);
//         }
//     }
// )
//
// const multerFilter = (req, file, cb) => {
//     const fileExtension = path.extname(file.originalname);
//     const allowExtension = ['.doc', '.docx', '.pdf'];
//     if (allowExtension.includes(fileExtension.toLowerCase())) {
//         cb(null, true);
//     } else {
//         cb(new AppError("Not a .doc, .docx, or .pdf selected", 400), false);
//     }
// }

exports.uploadCertificates = multer(
    {
        storage: multerStorage(`${__dirname}/../public/data/shipment`, '', false),
        fileFilter: multerFilter
    }
)

// exports.uploadCertificates = upload;