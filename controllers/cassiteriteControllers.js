const Cassiterite = require('../models/cassiteriteEntryModel');
const Supplier = require('../models/supplierModel');
const Settings = require('../models/settingsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const {handleConvertToUSD} = require("../utils/helperFunctions");


exports.getAllCassiteriteEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Cassiterite.find({}), req.query)
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

exports.createCassiteriteEntry = catchAsync(async (req, res, next) => {
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) return next(new AppError("This supplier no longer exists!", 400));
    let entry;
    if (req.body.isSupplierBeneficiary) {
        entry = await Cassiterite.create(
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
        entry = await Cassiterite.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: "kanzamin license",
                beneficiary: req.body.beneficiary,
                TINNumber: "Kanzamin TIN",
                email: "kanzamin@gmail.com",
                representativeId: "Kanzamin representative",
                representativePhoneNumber: "+250780000000",
            }
        )
    } else if (req.body.isSupplierBeneficiary === false && supplier.companyName.toLowerCase() !== "kanzamin") {
        entry = await Cassiterite.create(
            {
                supplierId: supplier._id,
                companyName: supplier.companyName,
                licenseNumber: supplier.licenseNumber,
                beneficiary: req.body.beneficiary,
                TINNumber: supplier.TINNumber,
                email: supplier.email,
                representativeId: req.body.representativeId,
                representativePhoneNumber: req.body.representativePhoneNumber,
            }
        )
    }
    entry.mineralType = req.body.mineralType;
    entry.numberOfTags = req.body.numberOfTags;
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
                    londonMetalExchange: null,
                    treatmentCharges: null,
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

exports.getOneCassiteriteEntry = catchAsync(async (req, res, next) => {
    const entry = await Cassiterite.findById(req.params.entryId);
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

exports.updateCassiteriteEntry = catchAsync(async (req, res, next) => {
    const entry = await Cassiterite.findById(req.params.entryId);
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
    const { rmaFeeCassiterite } = await Settings.findOne();
    if (req.body.output) {
        entry.output = [];
        for (const lot of req.body.output) {
            const singleLot = {
                lotNumber: lot.lotNumber,
                weightOut: lot.weightOut,
                cumulativeAmount: lot.cumulativeAmount,
            }
            if (singleLot.weightOut) singleLot.rmaFee = rmaFeeCassiterite * singleLot.weightOut;
            if (lot.mineralGrade) singleLot.mineralGrade = lot.mineralGrade;
            if (lot.londonMetalExchange) singleLot.londonMetalExchange = lot.londonMetalExchange;
            if (lot.treatmentCharges) singleLot.treatmentCharges = lot.treatmentCharges;
            if (lot.rmaFeeDecision) singleLot.rmaFeeDecision = lot.rmaFeeDecision;
            if (lot.USDRate) singleLot.USDRate = lot.USDRate;
            if (lot.status) singleLot.status = lot.status;
            if (singleLot.londonMetalExchange && singleLot.mineralGrade && singleLot.treatmentCharges) {
                singleLot.pricePerUnit = ((singleLot.londonMetalExchange * (singleLot.mineralGrade/100)) - singleLot.treatmentCharges) / 1000;
            }
            if (singleLot.USDRate && singleLot.rmaFee) singleLot.rmaFeeUSD = handleConvertToUSD(singleLot.rmaFee, singleLot.USDRate);
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

exports.deleteCassiteriteEntry = catchAsync(async (req, res, next) => {
    const entry = await Cassiterite.findByIdAndDelete(req.params.entryId);
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})