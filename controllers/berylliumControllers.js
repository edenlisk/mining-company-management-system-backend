const Beryllium = require('../models/berylliumEntryModel');
const Supplier = require('../models/supplierModel');
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
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) return next(new AppError("This supplier no longer exists!", 400));
    let entry;
    if (req.body.isSupplierBeneficiary) {
        entry = await Beryllium.create(
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
        entry = await Beryllium.create(
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
        entry = await Beryllium.create(
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
    entry.mineralType = "Beryllium";
    entry.weightIn = req.body.weightIn;
    entry.weightOut = req.body.weightOut;
    entry.supplyDate = req.body.supplyDate;
    entry.time = req.body.time;
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
