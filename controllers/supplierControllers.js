const Supplier = require('../models/supplierModel');
const catchAsync = require('../utils/catchAsync');
const AppError  = require('../utils/appError');


exports.getAllSuppliers = catchAsync(async (req, res, next) => {
    const suppliers = await Supplier.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    suppliers
                }
            }
        )
    ;
})

exports.addSupplier = catchAsync(async (req, res, next) => {
    await Supplier.create(
        {
            companyName: req.body.companyName,
            TINNumber: req.body.TINNumber,
            licenseNumber: req.body.licenseNumber,
            email: req.body.email,
            nationalId: req.body.nationalId,
            phoneNumber: req.body.phoneNumber,
            mineSites: req.body.mineSites,
            address: req.body.address,
            typeOfMinerals: req.body.typeOfMinerals,
            numberOfDiggers: req.body.numberOfDiggers,
            numberOfWashers: req.body.numberOfWashers,
            numberOfTransporters: req.body.numberOfTransporters
        }
    )
    res
        .status(201)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.updateSupplier = catchAsync(async (req, res, next) => {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) return next(new AppError("Selected supplier no longer exists!", 400));
    if (req.body.numberOfDiggers) supplier.numberOfDiggers = req.body.numberOfDiggers;
    if (req.body.numberOfWashers) supplier.numberOfWashers = req.body.numberOfWashers;
    if (req.body.numberOfTransporters) supplier.numberOfTransporters = req.body.numberOfTransporters;
    if (req.body.status) supplier.status = req.body.status;
    if (req.body.comment) supplier.observations.push(req.body.comment);
    if (req.body.phoneNumber) supplier.phoneNumber = req.body.phoneNumber;
    await supplier.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.getOneSupplier = catchAsync(async (req, res, next) => {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) return next(new AppError("Selected supplier no longer exists!", 400));
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    supplier
                }
            }
        )
    ;
})

exports.deleteSupplier = catchAsync(async (req, res, next) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.supplierId);
    if (!supplier) return next(new AppError("Selected supplier no longer exists!", 400));
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})