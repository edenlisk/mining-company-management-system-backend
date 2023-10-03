const Invoice = require('../models/invoiceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


exports.getAllInvoices = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Invoice.find({}), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    ;
    const invoices = await result.mongooseQuery;
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    invoices
                }
            }
        )
    ;
})

exports.generateInvoice = catchAsync(async (req, res, next) => {
     await Invoice.create(
         {
             paymentDate: req.body.paymentDate,
             items: req.body.items,
             supplierAddress: req.body.supplierAddress,
             paymentToAddress: req.body.paymentToAddress,
             paymentToEmail: req.body.paymentToEmail,
             paymentNo: req.body.paymentNo,
             supplierEmail: req.body.supplierEmail,
             extraNotes: req.body.extraNotes
         }
     )

    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

