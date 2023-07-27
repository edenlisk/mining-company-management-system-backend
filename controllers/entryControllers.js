// const Entry = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const Coltan = require('../models/coltanEntryModel');
const Cassiterite = require('../models/cassiteriteEntryModel');
const Mixed = require('../models/mixedMineralsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

module.exports = getModel = (model) => {
    switch (model) {
        case "cassiterite":
            return Cassiterite;
        case "coltan":
            return Coltan;
        case "mixed":
            return Mixed
    }
}

exports.getAllEntries = catchAsync(async (req, res, next) => {
    const coltanEntries = await Coltan.find();
    const cassiteriteEnties = await Cassiterite.find();
    const mixedEntries = await Mixed.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    entries: [...coltanEntries, ...cassiteriteEnties, ...mixedEntries]
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
    if (req.params.model === "mixed") {
        entry.quantity.coltan = req.body.coltan;
        entry.quantity.cassiterite = req.body.cassiterite;
        entry.cumulativeAmount.cassiterite = entry.quantity.cassiterite;
        entry.cumulativeAmount.coltan = entry.quantity.coltan;
    }
    entry.numberOfTags = req.body.numberOfTags;
    entry.grossQuantity = req.body.grossQuantity;
    entry.netQuantity = req.body.netQuantity;
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
    const Entry = getModel(req.params.model);
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("This entry no longer exists", 400));
    // if (req.body.mineralSupplied) entry.mineralSupplied = req.body.mineralSupplied;
    // if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    // if (req.body.grossQuantity) entry.grossQuantity = req.body.grossQuantity;
    // if (req.body.netQuantity) entry.netQuantity = req.body.netQuantity;
    if (req.body.status === "in stock") entry.status = "in stock";
    if (req.body.status === "exported") entry.status = "exported";
    if (req.body.status === "non-sell agreement") entry.status = "non-sell agreement";
    if (req.body.status === "rejected") entry.status = "rejected";
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.params.model === "coltan" || req.params.model === "cassiterite") {
        if (req.body.mineTags) entry.mineTags = req.body.mineTags;
        if (req.body.negociantTags) entry.negociantTags = req.body.negociantTags;
        if (req.body.grade) entry.grade = req.body.grade;
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
    // TODO 2: RESTRUCTURE BOTH MINE AND NEGOCIANT TAGS
    // if (req.body.totalPrice) entry.totalPrice = req.body.totalPrice;
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
