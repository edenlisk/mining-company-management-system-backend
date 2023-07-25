const Entry = require('../models/EntryModel');
const Supplier = require('../models/supplierModel');
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
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) return next(new AppError("Selected supplier no longer exists!", 400));
    let entry;
    if (req.body.isSupplierBeneficiary) {
        entry = await Entry.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: supplier.licenseNumber,
                beneficiary: supplier.companyRepresentative,
                TINNumber: supplier.TINNumber,
                email: supplier.email,
                representativeId: supplier.representativeId,
                representativePhoneNumber: supplier.representativePhoneNumber,
            }
        )
    } else if (supplier.companyName.toLowerCase() === "kanzamin") {
        entry = await Entry.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: "kanzamin license",
                beneficiary: req.body.beneficiary,
                TINNumber: "Kanzamin TIN",
                email: "kanzamin@gmail.com",
                representativeId: "Kanzamin representative",
                representativePhoneNumber: "+250780000000"
            }
        )
    } else if (req.body.isSupplierBeneficiary === false && supplier.companyName.toLowerCase() !== "kanzamin") {
        entry = await Entry.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: supplier.licenseNumber,
                beneficiary: req.body.beneficiary,
                TINNumber: supplier.TINNumber,
                email: supplier.email,
                representativeId: req.body.representativeId,
                representativePhoneNumber: req.body.representativePhoneNumber
            }
        )
    }
    entry.mineralSupplied = req.body.mineralSupplied;
    if (entry.mineralSupplied === "mixed") {
        entry.coltanQuantity = req.body.coltanQuantity;
        entry.cassiteriteQuantity = req.body.cassiteriteQuantity;
    }
    entry.grossQuantity = req.body.grossQuantity;
    entry.netQuantity = req.body.netQuantity;
    entry.numberOfTags = req.body.numberOfTags;
    entry.supplyDate = new Date().toISOString().split('T')[0];
    entry.time = req.body.time;
    await entry.save({validateModifiedOnly: true});
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
    // if (req.body.mineralSupplied) entry.mineralSupplied = req.body.mineralSupplied;
    // if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    // if (req.body.grossQuantity) entry.grossQuantity = req.body.grossQuantity;
    // if (req.body.netQuantity) entry.netQuantity = req.body.netQuantity;
    if (req.body.status.toLowerCase() === "in stock") entry.status = "in stock";
    if (req.body.status.toLowerCase() === "exported") entry.status = "exported";
    if (req.body.status.toLowerCase() === "non-sell agreement") entry.status = "non-sell agreement";
    if (req.body.status.toLowerCase() === "rejected") entry.status = "rejected";
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.body.mineTags) entry.mineTags = req.body.mineTags;
    if (req.body.londonMetalExchange) entry.londonMetalExchange = req.body.londonMetalExchange;
    if (req.body.treatmentCharges) entry.treatmentCharges = req.body.treatmentCharges;
    if (req.body.tantal) entry.tantal = req.body.tantal;
    if (req.body.rmaFee) entry.rmaFee = req.body.rmaFee;
    if (req.body.negociantTags) entry.negociantTags = req.body.negociantTags;
    if (req.body.mineralGrade) entry.mineralGrade = req.body.mineralGrade;
    if (req.body.mineralPrice) entry.mineralPrice = req.body.mineralPrice;
    if (req.body.cassiteriteGrade) entry.cassiteriteGrade = req.body.cassiteriteGrade;
    if (req.body.coltanGrade) entry.coltanGrade = req.body.coltanGrade;
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
