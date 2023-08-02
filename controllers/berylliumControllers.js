const Beryllium = require('../models/berylliumEntryModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllBerylliumEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Beryllium.find({}), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    ;
    const entries = await result.mongooseQuery;
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    entries
                }
            }
        )
    ;
})

exports.createBerylliumEntry = catchAsync(async (req, res, next) => {
    await Beryllium.create(
        {
            supplier: req.body.supplier,
            phoneNumber: req.body.phoneNumber,
            mineralType: req.body.mineralType,
            weightIn: req.body.weightIn,
            weightOut: req.body.weightOut,
            supplyDate: req.body.supplyDate,
            time: req.body.time,
            cumulativeAmount: req.body.weightOut,
            exportedAmount: 0,
            paid: 0,
            settled: false,
            status: "in stock"
        }
    );
    res
        .status(204)
        .json(
            {
                status: "Success",
            }
        )
    ;
})

exports.getOneBerylliumEntry = catchAsync(async (req, res, next) => {
    const entry = await Beryllium.findById(req.params.entryId);
    if (!entry) return next(new AppError("This Entry no longer exists!", 400));
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    entry
                }
            }
        )
    ;
})

exports.updateBerylliumEntry = catchAsync(async (req, res, next) => {
    const entry = await Beryllium.findById(req.params.entryId);
    if (!entry) return next(new AppError("This Entry no longer exists!", 400));
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.body.weightOut) entry.weightOut = req.body.weightOut;
    if (req.body.mineralGrade) entry.mineralGrade = req.body.mineralGrade;
    if (req.body.price) entry.price = req.body.price;
    if (req.body.pricePerUnit) entry.pricePerUnit = req.body.pricePerUnit;
    if (req.body.status) entry.status = req.body.status;
    await entry.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success",
            }
        )
    ;
})

exports.deleteBerylliumEntry = catchAsync(async (req, res, next) => {
    const entry = await Beryllium.findByIdAndDelete(req.params.entryId);
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})
