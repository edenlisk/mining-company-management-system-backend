const Cassiterite = require('../models/cassiteriteEntryModel');
const Supplier = require('../models/supplierModel');
const Settings = require('../models/settingsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const multer = require("multer");
const exifreader = require('exifreader');
const {handleConvertToUSD} = require("../utils/helperFunctions");
const imagekit = require('../utils/imagekit');
const fs = require("fs");
const path = require("path");
const { trackUpdateModifications,
    trackDeleteOperations,
    trackCreateOperations } = require('./activityLogsControllers');


exports.getAllCassiteriteEntries = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Cassiterite.find(), req.query)
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
    // const logs = [];
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) return next(new AppError("This supplier no longer exists!", 400));
    let entry;
    if (req.body.isSupplierBeneficiary) {
        entry = await Cassiterite.create(
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
                companyRepresentative: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.representativeId
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
                companyRepresentative: supplier.companyRepresentative ? supplier.companyRepresentative : req.body.representativeId
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
    // const log = trackCreateOperations(entry?._id, "cassiterite", req);
    await entry.save({validateModifiedOnly: true});
    // if (!result) {
    //     log.status = "failed";
    // }
    // await log.save({validateBeforeSave: false});

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
    // if (!entry.visible) return next(new AppError("Please restore this entry to update it!", 400));
    if (!entry) return next(new AppError("This Entry no longer exists!", 400));
    // req.user = {};
    // req.user.username = "admin";
    // req.user.userId = entry._id;
    // const logs = trackUpdateModifications(req.body, entry, req);
    if (req.files) {
        for (const file of req.files) {
            const fileData = fs.readFileSync(file.path);
            // const exifData = await exifreader.load(file.path);
            // console.log(exifData);
            // // Access specific properties from the EXIF data, e.g., exifData['DateTimeOriginal']
            // const dateTaken = exifData['DateTimeOriginal'].description;
            // console.log(dateTaken);
            const response = await imagekit.upload({
                file: fileData,
                fileName: file.originalname,
                folder: `/coltan`
            });

            if (response) {
                fs.readFile(file.path, (err, data) => {
                    if (err) {
                        return next(new AppError("Error occurred while processing file"))
                    } else {
                        const tags = exifreader.load(data);
                        const imageDate = tags['CreateDate'];
                        const lot = entry.output.find(item => item.lotNumber === parseInt(file.fieldname));
                        lot.gradeImg.filename = response.name;
                        // logs.modifications.push(
                        //     {
                        //         fieldName: "gradeImg",
                        //         initialValue: `${lot.gradeImg.filePath}--${lot.gradeImg?.createdAt}`,
                        //         newValue: `${response.url}--${imageDate ? imageDate.description : "No date"}`,
                        //     }
                        // )
                        lot.gradeImg.filePath = response.url;
                        lot.gradeImg.fileId = response.fileId;
                        if (imageDate) {
                            lot.gradeImg.createdAt = imageDate.description;
                        }
                    }
                    fs.unlink(file.path, () => {
                        console.log('file deleted successfully from file system');
                    })
                })

            }


            // const exifData = exifParser.create(file.buffer).parse();
            // const dateTaken = exifData.tags['DateTimeOriginal'];
            // console.log(file.buffer);
        }
    }

    if (req.body.supplierId) entry.supplierId = req.body.supplierId;
    if (req.body.numberOfTags) entry.numberOfTags = req.body.numberOfTags;
    if (req.body.companyName) entry.companyName = req.body.companyName;
    if (req.body.beneficiary) entry.beneficiary = req.body.beneficiary;
    if (req.body.TINNumber) entry.TINNumber = req.body.TINNumber;
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
        for (const lot of req.body.output) {
            const existingLot = entry.output.find(value => value.lotNumber === lot.lotNumber);
            if (existingLot) {
                if (lot.mineralGrade) existingLot.mineralGrade = lot.mineralGrade;
                if (lot.mineralPrice) existingLot.mineralPrice = lot.mineralPrice;
                if (lot.treatmentCharges) existingLot.treatmentCharges = lot.treatmentCharges;
                if (lot.londonMetalExchange) existingLot.londonMetalExchange = lot.londonMetalExchange;
                if (lot.USDRate) existingLot.USDRate = lot.USDRate;
                if (lot.rmaFeeDecision) existingLot.rmaFeeDecision = lot.rmaFeeDecision;
                if (existingLot.weightOut && rmaFeeCassiterite) {
                    existingLot.rmaFee = rmaFeeCassiterite * existingLot.weightOut;
                }
                if (existingLot.rmaFee && existingLot.USDRate) {
                    existingLot.rmaFeeUSD = handleConvertToUSD(existingLot.rmaFee, existingLot.USDRate).toFixed(3);
                }
                // if (existingLot.treatmentCharges && existingLot.mineralGrade && existingLot.londonMetalExchange) {
                //     existingLot.pricePerUnit = (((existingLot.londonMetalExchange * (existingLot.mineralGrade/100)) - existingLot.treatmentCharges) / 1000).toFixed(3);
                //     existingLot.mineralPrice = (existingLot.pricePerUnit * existingLot.weightOut).toFixed(3);
                //     if (!existingLot.unpaid && existingLot.unpaid !== 0) {
                //         existingLot.unpaid = existingLot.mineralPrice;
                //     }
                // }
            }
        }
    }

    const result = entry.save({validateModifiedOnly: true});
    // if (!result) {
    //     logs.status = "failed";
    // }
    // await logs.save({validateBeforeSave: false});
    res
        .status(201)
        .json(
            {
                status: "Success",
            }
        )
    ;
})

exports.deleteCassiteriteEntry = catchAsync(async (req, res, next) => {
    // const log = trackDeleteOperations(req.params.entryId, "cassiterite", req);
    const entry = await Cassiterite.findByIdAndUpdate(req.params.entryId, {visible: false});
    if (!entry) {
        // log.status = "failed";
        // log.link = `/complete/cassiterite/${req.params.entryId}`;
        // await log.save({validateBeforeSave: false});
        return next(new AppError("The selected entry no longer exists!", 400));
    }
    // else {
    //     await log.save({validateBeforeSave: false});
    // }

    // logs.push(`${req.user.username} deleted this cassiterite entry supplied by: ${entry.companyName} on ${entry.supplyDate}`);
    // const preparedLogs = prepareLog(logs, `/complete/cassiterite/${entry?._id}`,{userId: req.user._id, username: req.user.username});
    // await recordLogs(preparedLogs);
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
    const entries = await Cassiterite.find({visible: false});
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


const multerStorage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/../public/data/cassiterite`);
        },
        filename: function (req, file, cb) {
            // const fileExtension = path.extname(file.originalname);
            // const filePath = `${__dirname}/../public/data/shipment/${req.params.shipmentId}/${file.originalname}`;
            cb(null, file.originalname);
        }
    }
)

const multerFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const allowExtension = ['.png', '.jpg', '.jpeg'];
    if (allowExtension.includes(fileExtension.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new AppError("Not a .jpg, .jpeg or .png file selected", 400), false);
    }
}

const upload = multer(
    {
        storage: multerStorage,
        fileFilter: multerFilter
    }
)

exports.uploadGradeImg = upload;
