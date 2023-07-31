const Supplier = require('../models/supplierModel');
const Coltan = require('../models/coltanEntryModel');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Mixed = require('../models/mixedMineralsModel');
const Wolframite = require('../models/wolframiteEntryModel');
const { getModel } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllEntries = catchAsync(async (req, res, next) => {
    const GeneralEntry = require('../models/generalEntryModel');
    const coltanEntries = await Coltan.find();
    const cassiteriteEnties = await Cassiterite.find();
    const mixedEntries = await Mixed.find();
    const wolframiteEntries = await Wolframite.find();
    const generalEntries = await GeneralEntry.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    entries: [...coltanEntries, ...wolframiteEntries, ...cassiteriteEnties, ...mixedEntries, ...generalEntries]
                }
            }
        )
    ;
})

exports.getOneEntry = catchAsync(async (req, res, next) => {
    const Entry = getModel(req.params.model);
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
    const Entry = getModel(req.params.model);
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
                mineralType: req.body.mineralType,
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
                representativePhoneNumber: "+250780000000",
                mineralType: req.body.mineralType,
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
                representativePhoneNumber: req.body.representativePhoneNumber,
                mineralType: req.body.mineralType
            }
        )
    }
    entry.numberOfTags = req.body.numberOfTags;
    entry.grossQuantity = req.body.grossQuantity;
    entry.netQuantity = req.body.netQuantity;
    entry.supplyDate = new Date().toISOString().split('T')[0];
    entry.time = req.body.time;
    if (req.params.model === "mixed") {
        entry.quantity.coltan = req.body.coltan;
        entry.quantity.cassiterite = req.body.cassiterite;
        entry.cumulativeAmount.cassiterite = entry.quantity.cassiterite;
        entry.cumulativeAmount.coltan = entry.quantity.coltan;
    }
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
    const Entry = getModel(req.params.model);
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("This entry no longer exists", 400));
    if (req.body.status === "in stock") entry.status = "in stock";
    if (req.body.status === "exported") entry.status = "exported";
    if (req.body.status === "non-sell agreement") entry.status = "non-sell agreement";
    if (req.body.status === "rejected") entry.status = "rejected";
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.params.model === "general") {
        if (req.body.grade) entry.grade = req.body.grade;
        if (req.body.netQuantity) entry.netQuantity = req.body.netQuantity;
    }
    if (req.params.model === "coltan" || req.params.model === "cassiterite" || req.params.model === "wolframite") {
        if (req.body.mineTags) entry.mineTags = req.body.mineTags;
        if (req.body.negociantTags) entry.negociantTags = req.body.negociantTags;
        if (req.body.grade) entry.grade = req.body.grade;
        if (req.body.netQuantity) entry.netQuantity = req.body.netQuantity;
    }
    if (req.params.model === "coltan") {
        if (req.body.tantal) entry.tantal = req.body.tantal;
    }
    if (req.params.model === "cassiterite") {
        if (req.body.londonMetalExchange) entry.londonMetalExchange = req.body.londonMetalExchange;
        if (req.body.treatmentCharges) entry.treatmentCharges = req.body.treatmentCharges;
    }
    if (req.params.model === "mixed") {
        if (req.body.coltan) entry.quantity.coltan = req.body.coltan;
        if (req.body.cassiterite) entry.quantity.cassiterite = req.body.cassiterite;
        if (req.body.cassiteriteGrade) entry.grade.cassiterite = req.body.cassiteriteGrade;
        if (req.body.coltanGrade) entry.grade.coltan = req.body.coltanGrade;
    }
    if (req.body.paymentCurrency) entry.paymentCurrency = req.body.paymentCurrency;
    if (req.body.paymentMode) entry.paymentMode = req.body.paymentMode;
    // TODO 2: RESTRUCTURE BOTH MINE AND NEGOCIANT TAGS -> DONE
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
    const Entry = getModel(req.params.model);
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
