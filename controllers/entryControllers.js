const {createNewEntry, updateNegociantTags, updateMineTags} = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const exifreader = require('exifreader');
const fs = require("fs");
require('dotenv').config();
const imagekit = require('../utils/imagekit');
const Entry = require('../models/entryModel');


exports.getAllEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Entry.find({$or: [{mineralType: req.params.model}, {model: req.params.model}]}), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    ;
    const entries = await result.mongooseQuery;
    const numberOfDocuments = await Entry.countDocuments();

    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    entries,
                    numberOfDocuments
                }
            }
        )
    ;
})

exports.getOneEntry = catchAsync(async (req, res, next) => {
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError(`${req.params.model?.toUpperCase()} entry was not found, please try again latter`, 400));
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
    let entry;
    if (req.body.mineralType !== "mixed") {
        entry = await createNewEntry(req, Entry, req.body.mineralType);
    } else {
        for (const model of ["coltan", "cassiterite"]) {
            entry = await createNewEntry(req, Entry, model);
        }
    }

    res
        .status(201)
        .json(
            {
                status: "Success",
                entry
            }
        )
    ;
})

exports.updateEntry = catchAsync(async (req, res, next) => {
    // const Entry = getModel(req.params.model);
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("This entry no longer exists", 400));
    if (req.files) {
        const filePromises = req.files.map(async (file) => {
            const fileData = fs.readFileSync(file.path);
            const response = await imagekit.upload({
                file: fileData,
                fileName: `${entry.companyName}-${entry.beneficiary}-${entry.supplyDate}-${file.fieldname}`,
                folder: `/${req.params.model}`
            });
            if (response) {
                return new Promise((resolve, reject) => {
                    fs.readFile(file.path, (err, data) => {
                        if (err) {
                            reject(new AppError("Error occurred while processing file"));
                        } else {
                            const tags = exifreader.load(data);
                            const imageDate = tags['CreateDate'];
                            const lot = entry.output.find(item => parseInt(item.lotNumber) === parseInt(file.fieldname));
                            lot.gradeImg.filename = response.name;
                            lot.gradeImg.filePath = response.url;
                            lot.gradeImg.fileId = response.fileId;
                            if (imageDate) {
                                lot.gradeImg.createdAt = imageDate.description;
                            }
                            resolve();
                        }
                        fs.unlink(file.path, () => {
                            console.log('file deleted successfully from file system');
                        });
                    });
                });
            }
        });
        await Promise.all(filePromises);
    }
    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    // TODO 2: FIX TAGS --> CREATE SEPARATE CONTROLLER METHODS
    // if (req.body.mineTags) await updateMineTags(req.body.mineTags, entry);
    // if (req.body.negociantTags) await updateNegociantTags(req.body.negociantTags, entry);
    if (req.body.weightIn) entry.weightIn = req.body.weightIn;
    if (req.body.supplyDate) entry.supplyDate = req.body.supplyDate;
    if (req.body.time) entry.time = req.body.time;
    if (req.body.beneficiary) entry.beneficiary = req.body.beneficiary;
    if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    // if (req.body.output) {
    //     for (const lot of req.body.output) {
    //         const existingLot = entry.output.find(el => parseInt(el.lotNumber) === parseInt(lot.lotNumber));
    //         if (existingLot) {
    //             // COMMON FIELDS
    //             if (lot.weightIn) {
    //                 if (parseFloat(lot.weightIn) !== existingLot.weightIn) existingLot.weightIn = lot.weightIn;
    //             }
    //
    //             if (lot.weightOut) {
    //                 if (parseFloat(lot.weightOut) !== existingLot.weightOut) existingLot.weightOut = lot.weightOut;
    //             }
    //             if (lot.mineralGrade) {
    //                 if (parseFloat(lot.mineralGrade) !== existingLot.mineralGrade) existingLot.mineralGrade = lot.mineralGrade;
    //             }
    //             if (lot.pricingGrade) {
    //                 if (lot.pricingGrade !== existingLot.pricingGrade) existingLot.pricingGrade = lot.pricingGrade;
    //             }
    //             if (lot.ASIR) {
    //                 if (parseFloat(lot.ASIR) !== existingLot.ASIR) existingLot.ASIR = lot.ASIR;
    //             }
    //             if (lot.sampleIdentification) {
    //                 if (lot.sampleIdentification !== existingLot.sampleIdentification) existingLot.sampleIdentification = lot.sampleIdentification;
    //             }
    //             if (lot.USDRate) {
    //                 if (parseFloat(lot.USDRate) !== existingLot.USDRate) existingLot.USDRate = lot.USDRate;
    //             }
    //             if (lot.nonSellAgreement) {
    //                 if (lot.nonSellAgreement?.weight !== existingLot.nonSellAgreement.weight) {
    //                     if (parseFloat(lot.nonSellAgreement?.weight) > 0) {
    //                         existingLot.nonSellAgreement.weight = existingLot.weightOut;
    //                         existingLot.nonSellAgreement.date = new Date();
    //                     } else if (parseFloat(lot.nonSellAgreement?.weight) === 0) {
    //                         existingLot.nonSellAgreement.weight = 0;
    //                         existingLot.nonSellAgreement.date = null;
    //                     }
    //                 }
    //             }
    //             if (lot.comment) {
    //                 if (lot.comment !== existingLot.comment) existingLot.comment = lot.comment;
    //             }
    //             // SPECIFIC FIELDS
    //             // 1. COLTAN
    //             if (lot.tantal) {
    //                 if (parseFloat(lot.tantal) !== existingLot.tantal) existingLot.tantal = lot.tantal;
    //             }
    //             if (lot.niobium) {
    //                 if (parseFloat(lot.niobium) !== existingLot.niobium) existingLot.niobium = lot.niobium;
    //             }
    //             if (lot.iron) {
    //                 if (parseFloat(lot.iron) !== existingLot.iron) existingLot.iron = lot.iron;
    //             }
    //             // 2. CASSITERITE
    //             if (lot.londonMetalExchange) {
    //                 if (lot.londonMetalExchange !== existingLot.londonMetalExchange) existingLot.londonMetalExchange = lot.londonMetalExchange;
    //             }
    //             if (lot.treatmentCharges) {
    //                 if (lot.treatmentCharges !== existingLot.treatmentCharges) existingLot.treatmentCharges = lot.treatmentCharges;
    //             }
    //             // 3. WOLFRAMITE
    //             if (lot.metricTonUnit) {
    //                 if (lot.metricTonUnit !== existingLot.metricTonUnit) existingLot.metricTonUnit = lot.metricTonUnit;
    //             }
    //             if (["lithium", "beryllium"].includes(req.params.model)) {
    //                 if (lot.pricePerUnit) {
    //                     if (parseFloat(lot.pricePerUnit) !== existingLot.pricePerUnit) existingLot.pricePerUnit = lot.pricePerUnit;
    //                 }
    //             }
    //         } else {
    //             entry.output.push(lot);
    //         }
    //     }
    // }
    await entry.save({validateModifiedOnly: true});
    res
        .status(202)
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

exports.deleteEntry = catchAsync(async (req, res, next) => {
    // const Entry = getModel(req.params.model);
    const entry = await Entry.findByIdAndUpdate(req.params.entryId, {visible: false}, {lean: true, new: true});
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

exports.deleteGradeImg = catchAsync(async (req, res, next) => {
    // const Entry = getModel(req.params.model);
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("Unable to delete gradeImg!", 400));
    const lot = entry.output?.find(item => parseInt(item.lotNumber) === parseInt(req.body.lotNumber));
    if (!lot) return next(new AppError("Unable to delete gradeImg!", 400));
    lot.gradeImg = undefined;
    await entry.save({validateModifiedOnly: true});
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})
