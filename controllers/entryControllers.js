const Entry = require('../models/EntryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllEntries = catchAsync(async (req, res, next) => {
    const entries = await Entry.find().sort("-createdAt");
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

exports.getOneEntry = catchAsync(async (req, res, next) => {
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("Entry no longer exists", 400));
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

exports.createEntry = catchAsync(async (req, res, next) => {
    await Entry.create(
        {
            companyName: req.body.companyName.trim(),
            licenseNumber: req.body.licenseNumber.trim(),
            companyRepresentative: req.body.companyRepresentative.trim(),
            representativeId: req.body.representativeId.trim(),
            representativePhoneNumber: req.body.representativePhoneNumber.trim(),
            supplyDate: req.body.supplyDate,
            mineralSupplied: req.body.mineralSupplied,
            numberOfTags: req.body.numberOfTags,
            grossQuantity: req.body.grossQuantity,
            netQuantity: req.body.netQuantity,
            mineTags: req.body.mineTags,
            negociantTags: req.body.negociantTags,
            mineralGrade: req.body.mineralGrade,
            mineralPrice: req.body.mineralPrice
        }
    );
    res
        .status(201)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.updateEntry = catchAsync(async (req, res, next) => {
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("This entry no longer exists", 400));
    if (req.body.mineralSupplied) entry.mineralSupplied = req.body.mineralSupplied;
    if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    if (req.body.grossQuantity) entry.grossQuantity = req.body.grossQuantity;
    if (req.body.netQuantity) entry.netQuantity = req.body.netQuantity;
    if (req.body.status === "in stock") entry.status = "in stock";
    if (req.body.status === "exported") entry.status = "exported";
    if (req.body.mineTags) entry.mineTags = req.body.mineTags;
    if (req.body.negociantTags) entry.negociantTags = req.body.negociantTags;
    if (req.body.mineralPrice) entry.mineralPrice = req.body.mineralPrice;
    await entry.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.deleteEntry = catchAsync(async (req, res, next) => {
    const entry = await Entry.findByIdAndDelete(req.params.entryId);
    if (!entry) return next(new AppError("Entry was not found", 400));
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})
