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
            beneficiaryName: req.body.beneficiaryName,
            beneficiaryNationalId: req.body.beneficiaryNationalId,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            paymentAmount: req.body.paymentAmount,
            currency: req.body.currency,
            location: req.body.location,
            paymentDate: req.body.paymentDate,
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