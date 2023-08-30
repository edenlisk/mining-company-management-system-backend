const path = require('path');
const multer = require("multer");
const AdvancePayment = require('../models/advancePaymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllAdvancePayments = catchAsync(async (req, res, next) => {
    const payments = await AdvancePayment.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    payments
                }
            }
        )
    ;
})

exports.addAdvancePayment = catchAsync(async (req, res, next) => {
    await AdvancePayment.create(
        {
            supplierId: req.body.supplierId ? req.body.supplierId : null,
            beneficiaryName: req.body.beneficiaryName,
            beneficiaryNationalId: req.body.beneficiaryNationalId,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            paymentAmount: req.body.paymentAmount,
            currency: req.body.currency,
            location: req.body.location,
            paymentDate: req.body.paymentDate,
            contractName: req.file.filename,
            message: req.body.message,
        }
    )
    res
        .status(202)
        .json(
            {
                status: "Success",
            }
        )
    ;
})

exports.getOneAdvancePayment = catchAsync(async (req, res, next) => {
    const payment = await AdvancePayment.findById(req.params.paymentId);
    if (!payment) return next(new AppError("The Selected payment no longer exists!", 400));
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    payment
                }
            }
        )
    ;
})

exports.getAdvancePaymentsForSupplier = catchAsync(async (req, res, next) => {
    let payments;
    if (req.params.supplierId) {
        payments = await AdvancePayment.find({supplierId: req.params.supplierId, consumed: false});
    } else {
        payments = await AdvancePayment.find({consumed: false, supplierId: null});
    }
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    payments
                }
            }
        )
    ;
})

const multerStorage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/../public/data/payment-in-advance-contracts/${req.params.paymentId}`);
        },
        filename: function (req, file, cb) {
            // const fileExtension = path.extname(file.originalname);
            // const filePath = `${__dirname}/../public/data/shipment/${req.params.shipmentId}/${file.originalname}`;
            cb(null, file.originalname);
        }
    }
)

const multerFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const allowExtension = ['.doc', '.docx', '.pdf'];
    if (allowExtension.includes(fileExtension.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new AppError("Not a .doc, .docx, or .pdf selected", 400), false);
    }
}

const upload = multer(
    {
        storage: multerStorage,
        fileFilter: multerFilter
    }
)

exports.uploadContract = upload;