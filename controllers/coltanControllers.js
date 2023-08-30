const Coltan = require('../models/coltanEntryModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Supplier = require('../models/supplierModel');
const APIFeatures = require('../utils/apiFeatures');
const Settings = require('../models/settingsModel');
const { handleConvertToUSD } = require('../utils/helperFunctions');


exports.getAllColtanEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Coltan.find({}), req.query)
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

exports.createColtanEntry = catchAsync(async (req, res, next) => {
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) return next(new AppError("This supplier no longer exists!", 400));
    let entry;
    if (req.body.isSupplierBeneficiary) {
        entry = await Coltan.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: supplier.licenseNumber,
                companyRepresentative: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.companyRepresentative,
                beneficiary: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.companyRepresentative,
                TINNumber: supplier.TINNumber,
                email: supplier.email ? supplier.email : req.body.email,
                representativeId: supplier.representativeId ? supplier.representativeId : req.body.representativeId,
                representativePhoneNumber: supplier.representativePhoneNumber ? supplier.representativePhoneNumber : req.body.representativePhoneNumber,
            }
        )
    } else if (supplier.companyName.toLowerCase() === "kanzamin") {
        entry = await Coltan.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: "kanzamin license",
                beneficiary: req.body.beneficiary,
                TINNumber: "Kanzamin TIN",
                email: "kanzamin@gmail.com",
                representativeId: "Kanzamin representative",
                representativePhoneNumber: "+250780000000",
                companyRepresentative: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.representativeId
            }
        )
    } else if (req.body.isSupplierBeneficiary === false && supplier.companyName.toLowerCase() !== "kanzamin") {
        entry = await Coltan.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: supplier.licenseNumber,
                beneficiary: req.body.beneficiary,
                TINNumber: supplier.TINNumber,
                email: supplier.email,
                representativeId: req.body.representativeId,
                representativePhoneNumber: req.body.representativePhoneNumber,
                companyRepresentative: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.representativeId
            }
        )
    }
    if (req.body.mineralType) entry.mineralType = req.body.mineralType;
    if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    entry.weightIn = req.body.weightIn;
    entry.supplyDate = req.body.supplyDate;
    entry.time = req.body.time;
    if (req.body.output) {
        for (const lot of req.body.output) {
            entry.output.push(
                {
                    lotNumber: lot.lotNumber,
                    weightOut: lot.weightOut,
                    exportedAmount: 0,
                    cumulativeAmount: lot.weightOut,
                    rmaFee: null,
                    USDRate: null,
                    rmaFeeUSD: null,
                    rmaFeeDecision: "pending",
                    paid: 0,
                    mineralGrade: null,
                    mineralPrice: null,
                    pricePerUnit: null,
                    unpaid: null,
                    settled: false,
                    tantalum: null,
                    status: "in stock"
                }
            )
        }
    }
    await entry.save({validateModifiedOnly: true});
    res
        .status(204)
        .json(
            {
                status: "Success",
            }
        )
    ;
})

exports.getOneColtanEntry = catchAsync(async (req, res, next) => {
    const entry = await Coltan.findById(req.params.entryId);
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

exports.updateColtanEntry = catchAsync(async (req, res, next) => {
    const entry = await Coltan.findById(req.params.entryId);
    if (!entry) return next(new AppError("This Entry no longer exists!", 400));
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.body.mineTags) {
        entry.mineTags = [];
        for (const tag of req.body.mineTags) {
            entry.mineTags.push(
                {
                    weightInPerMineTag: tag.weightInPerMineTag,
                    tagNumber: tag.tagNumber,
                    status: tag.status
                }
            )
        }
    }
    if (req.body.negociantTags) {
        entry.negociantTags = [];
        for (const tag of req.body.negociantTags) {
            entry.negociantTags.push(
                {
                    weightOutPerNegociantTag: tag.weightOutPerNegociantTag,
                    tagNumber: tag.tagNumber,
                    status: tag.status
                }
            )
        }
    }
    const { rmaFeeColtan } = await Settings.findOne();
    if (req.body.output) {
        entry.output = [];
        for (const lot of req.body.output) {
            const singleLot = {
                ...lot,
                lotNumber: lot.lotNumber,
                weightOut: lot.weightOut,
                cumulativeAmount: lot.cumulativeAmount,
            }
            if (singleLot.weightOut) singleLot.rmaFee = rmaFeeColtan * singleLot.weightOut;
            if (lot.mineralGrade) singleLot.mineralGrade = lot.mineralGrade;
            if (lot.tantalum) singleLot.tantalum = lot.tantalum;
            if (singleLot.tantalum && singleLot.mineralGrade) {
                singleLot.pricePerUnit = singleLot.tantalum * singleLot.mineralGrade;
            }
            if (lot.USDRate) singleLot.USDRate = lot.USDRate;
            if (singleLot.USDRate && singleLot.rmaFee) singleLot.rmaFeeUSD = handleConvertToUSD(singleLot.rmaFee, singleLot.USDRate);
            if (lot.status) singleLot.status = lot.status;
            if (lot.rmaFeeDecision) singleLot.rmaFeeDecision = lot.rmaFeeDecision;
            if (singleLot.mineralGrade && singleLot.pricePerUnit && singleLot.weightOut) {
                singleLot.mineralPrice = singleLot.pricePerUnit * singleLot.weightOut;
            }
            entry.output.push(singleLot);
        }
    }
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

exports.deleteColtanEntry = catchAsync(async (req, res, next) => {
    const entry = await Coltan.findByIdAndDelete(req.params.entryId);
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})
