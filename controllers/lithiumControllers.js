const fs = require('fs');
const exifreader = require('exifreader');
const Lithium = require('../models/lithiumEntryModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const imagekit = require('../utils/imagekit');



exports.getAllLithiumEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Lithium.find(), req.query)
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

exports.createLithiumEntry = catchAsync(async (req, res, next) => {
    await Lithium.create(
        {
            supplierName: req.body.supplierName,
            phoneNumber: req.body.phoneNumber,
            mineralType: req.body.mineralType,
            weightIn: req.body.weightIn,
            weightOut: req.body.weightOut,
            supplyDate: req.body.supplyDate,
            time: req.body.time,
            cumulativeAmount: req.body.weightOut,
            exportedAmount: 0,
            paid: 0,
            mineralPrice: null,
            mineralGrade: null,
            pricePerUnit: null,
            unpaid: null,
            settled: false,
            status: "in stock",
            comment: req.body.comment,
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

exports.getOneLithiumEntry = catchAsync(async (req, res, next) => {
    const entry = await Lithium.findById(req.params.entryId);
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

exports.updateLithiumEntry = catchAsync(async (req, res, next) => {
    const entry = await Lithium.findById(req.params.entryId);
    // if (!entry.visible) return next(new AppError("Please restore this entry to update it!", 400));
    if (!entry) return next(new AppError("This Entry no longer exists!", 400));
    // if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    // const logs = trackUpdateModifications(req.body, entry, req);

    if (req.files) {
        for (const file of req.files) {
            const fileData = fs.readFileSync(file.path);
            const response = await imagekit.upload({
                file: fileData,
                fileName: file.originalname,
                folder: `/lithium`
            });

            if (response) {
                fs.readFile(file.path, (err, data) => {
                    if (err) {
                        return next(new AppError("Error occurred while processing file"))
                    } else {
                        const tags = exifreader.load(data);
                        const imageDate = tags['CreateDate'];
                        entry.gradeImg.filename = response.name;
                        // logs.modifications.push(
                        //     {
                        //         fieldName: "gradeImg",
                        //         initialValue: `${lot.gradeImg.filePath}--${lot.gradeImg?.createdAt}`,
                        //         newValue: `${response.url}--${imageDate ? imageDate.description : "No date"}`,
                        //     }
                        // )
                        entry.gradeImg.filePath = response.url;
                        entry.gradeImg.fileId = response.fileId;
                        if (imageDate) {
                            entry.gradeImg.createdAt = imageDate.description;
                        }
                    }
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            console.log('file deleted successfully from file system');
                        }
                    })
                })

            }

        }
    }
    if (req.body.weightIn) entry.weightIn = parseFloat(req.body.weightIn);
    if (req.body.weightOut) entry.weightOut = parseFloat(req.body.weightOut);
    if (req.body.mineralGrade) entry.mineralGrade = parseFloat(req.body.mineralGrade);
    if (req.body.pricePerUnit) entry.pricePerUnit = parseFloat(req.body.pricePerUnit);
    // if (req.body.nonSellAgreement?.weight) entry.nonSellAgreement.weight = req.body.nonSellAgreement?.weight;
    if (req.body.nonSellAgreement?.weight !== entry.nonSellAgreement?.weight) {
        if (req.nonSellAgreement?.weight > 0) {
            entry.cumulativeAmount = 0;
            entry.nonSellAgreement.weight = entry.weightOut;
            entry.status = "non-sell agreement"
            entry.nonSellAgreement.date = new Date();
        } else {
            if (req.nonSellAgreement?.weight === 0) {
                entry.cumulativeAmount = entry.weightOut;
                entry.nonSellAgreement.weight = 0;
                entry.status = "in stock"
                entry.nonSellAgreement.date = null;
            }
        }
    }
    if (req.body.mineralPrice) entry.mineralPrice = parseFloat(req.body.mineralPrice);
    if (entry.mineralPrice && parseFloat(req.body.mineralPrice)) {
        if (!entry.unpaid && entry.unpaid !== 0) {
            entry.unpaid = entry.mineralPrice;
        } else if (parseFloat(req.body.mineralPrice )> entry.mineralPrice) {
            entry.unpaid += parseFloat(req.body.mineralPrice )- entry.mineralPrice;
            if (Boolean(parseFloat(entry.paid))) {
                entry.paid -= parseFloat(req.body.mineralPrice )- entry.mineralPrice;
            }
        } else if (parseFloat(req.body.mineralPrice )< entry.mineralPrice) {
            entry.unpaid -= entry.mineralPrice - parseFloat(req.body.mineralPrice);
            if (Boolean(parseFloat(entry.paid))) {
                entry.paid += entry.mineralPrice - parseFloat(req.body.mineralPrice);
            }
        }
    }
    if (req.body.exportedAmount) entry.exportedAmount = req.body.exportedAmount;
    if (req.body.status) entry.status = req.body.status;
    if (req.body.comment) entry.comment = req.body.comment;
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

exports.deleteLithiumEntry = catchAsync(async (req, res, next) => {
    const entry = await Lithium.findByIdAndUpdate(req.params.entryId, {visible: false});
    if (!entry) return next(new AppError("The selected entry no longer exists!", 400));
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.trashEntries = catchAsync(async (req, res, next) => {
    const entries = await Lithium.find({visible: false});
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
