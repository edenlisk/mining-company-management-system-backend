const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPayments = catchAsync(async (req, res, next) => {
    const payments = await Payment.find();
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

exports.getOnePayment = catchAsync(async (req, res, next) => {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return next(new AppError("Something went wrong, please try again", 400));
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

exports.addPayment = catchAsync(async (req, res, next) => {
    await Payment.create(
        {
            // supplierId: req.body.supplierId,
            // supplierName: req.body.supplierName,
            entryId: req.body.entryId,
            lotNumber: req.body.lotNumber,
            beneficiary: req.body.beneficiary,
            // nationalId: req.body.nationalId,
            // licenseNumber: req.body.licenseNumber,
            phoneNumber: req.body.phoneNumber,
            // TINNumber: req.body.TINNumber,
            // email: req.body.email,
            location: req.body.location,
            paymentAmount: req.body.paymentAmount,
            currency: req.body.currency,
            paymentInAdvanceId: req.body.paymentInAdvanceId,
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
