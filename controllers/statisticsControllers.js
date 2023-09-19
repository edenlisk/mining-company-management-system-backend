const { getModel } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const Supplier = require('../models/supplierModel');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');

exports.detailedStock = catchAsync(async (req, res, next) => {
    const Entry = getModel(req.params.model);
    const detailedStock = [];
    if (req.params.model === "coltan" || req.params.model === "cassiterite" || req.params.model === "wolframite") {
        // TODO 16: CHANGE STATUS
        const entries = await Entry.find({output: {$elemMatch: {status: "in stock", cumulativeAmount: {$gt: 0}}}});
        for (const entry of entries) {
            for (const lot of entry.output) {
                detailedStock.push(
                    {
                        _id: entry._id,
                        supplierName: entry.companyName,
                        beneficiary: entry.beneficiary,
                        supplyDate: entry.supplyDate,
                        lotNumber: lot.lotNumber,
                        weightOut: lot.weightOut,
                        mineralGrade: lot.mineralGrade,
                        mineralPrice: lot.mineralPrice,
                        exportedAmount: lot.exportedAmount,
                        cumulativeAmount: lot.cumulativeAmount,
                        pricePerUnit: lot.pricePerUnit,
                        index: uuidv4(),
                    }
                );
            }
        }
    } else if (req.params.model === "lithium" || req.params.model === "beryllium") {
        const entries = await Entry.find({status: "in stock", cumulativeAmount: {$gt: 0}});
        for (const entry of entries) {
            detailedStock.push(
                {
                    _id: entry._id,
                    supplierName: entry.supplierName,
                    supplyDate: entry.supplyDate,
                    weightOut: entry.weightOut,
                    mineralGrade: entry.mineralGrade,
                    mineralPrice: entry.mineralPrice,
                    exportedAmount: entry.exportedAmount,
                    cumulativeAmount: entry.cumulativeAmount,
                    pricePerUnit: entry.pricePerUnit,
                    index: uuidv4(),
                }
            )
        }
    }
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    detailedStock
                }
            }
        )
    ;
})

exports.currentStock = catchAsync(async (req, res, next) => {
    const Cassiterite = getModel('cassiterite');
    const Coltan = getModel('coltan');
    const Wolframite = getModel('wolframite');
    const Lithium = getModel('lithium');
    const Beryllium = getModel('beryllium');
    const cassiteriteStock = await Cassiterite.aggregate(
        [
            {
                $unwind: "$output"
            },
            {
                $group: {
                    _id: null,
                    totalCumulativeAmount: { $sum: "$output.cumulativeAmount" }
                }
            }
        ]
    );
    const coltanStock = await Coltan.aggregate(
        [
            {
                $unwind: "$output"
            },
            {
                $group: {
                    _id: null,
                    totalCumulativeAmount: { $sum: "$output.cumulativeAmount" }
                }
            }
        ]
    )
    const wolframiteStock = await Wolframite.aggregate(
        [
            {
                $unwind: "$output"
            },
            {
                $group: {
                    _id: null,
                    totalCumulativeAmount: { $sum: "$output.cumulativeAmount" }
                }
            }
        ]
    )
    const berylliumStock = await Beryllium.aggregate(
        [
            {
                $group: {
                    _id: null,
                    totalCumulativeAmount: { $sum: "$cumulativeAmount" }
                }
            }
        ]
    )
    const lithumStock = await Lithium.aggregate(
        [
            {
                $group: {
                    _id: null,
                    totalCumulativeAmount: { $sum: "$cumulativeAmount" }
                }
            }
        ]
    )
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    stock: {
                        coltanStock,
                        cassiteriteStock,
                        wolframiteStock,
                        lithumStock,
                        berylliumStock
                    }
                }
            }
        )
    ;
})

exports.paymentHistory = catchAsync(async (req, res, next) => {
    let lotPaymentHistory = [];
    const Entry = getModel(req.params.model);
    const specificModel = ["cassiterite", "coltan", "wolframite"];
    const generalModel = ["lithium", "beryllium"];
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) return next(new AppError("The selected entry no longer exists!", 400));
    if (specificModel.includes(req.params.model)) {
        const lot = entry.output.find(value => value.lotNumber === parseInt(req.params.lotNumber));
        if (lot) lotPaymentHistory = lot.paymentHistory;
    } else if (generalModel.includes(req.params.model)) {
        if (entry) lotPaymentHistory = entry.paymentHistory;
    }
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    lotPaymentHistory
                }
            }
        )
    ;
})

exports.stockSummary = catchAsync(async (req, res, next) => {
    const models = ["cassiterite", "coltan", "wolframite"];
    const specificModels = ["lithium", "beryllium"];
    const stock = {};
    for (const specificModel of specificModels) {
        const Entry = getModel(specificModel);
        const entry = await Entry.aggregate(
            [
                {
                    $group: {
                        _id: null, // Group all documents into a single group
                        balance: { $sum: '$cumulativeAmount' }
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the "_id" field from the result
                        balance: 1
                    }
                }
            ]
        )
        stock[specificModel] = entry[0].balance;
    }
    for (const model of models) {
        const Entry = getModel(model);
        const entry = await Entry.aggregate(
            [
                {
                    $unwind: '$output' // Unwind the "output" array
                },
                {
                    $group: {
                        _id: null, // Group all documents into a single group
                        balance: { $sum: '$output.cumulativeAmount' }
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the "_id" field from the result
                        balance: 1
                    }
                }
            ]
        );
        stock[model] = entry[0].balance;
    }

    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    stock
                }
            }
        )
    ;
})

exports.lastCreatedEntries = catchAsync(async (req, res, next) => {
    const models = ["coltan", "cassiterite", "wolframite"];
    let lastCreated = [];
    for (const model of models) {
        const Entry = getModel(model);
        const entries = await Entry.find({})
            .sort({createdAt: -1})
            .limit(2)
            .select({output: 0, mineTags: 0, negociantTags: 0});
        lastCreated = [...lastCreated, ...entries];
    }

    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    lastCreated
                }
            }
        )
    ;
})

exports.topSuppliers = catchAsync(async (req, res, next) => {
    const models = ["coltan", "cassiterite", "wolframite"];
    let result = [];
    for (const model of models) {
        const Entry = getModel(model);
        const entries = await Entry.aggregate(
            [
                {
                    $match: {}
                },
                {
                    $group: {
                        _id: "$supplierId",
                        totalProduction: { $sum: "$weightIn" },
                        companyName: { $first: "$companyName" },
                        mineralType: { $first: "$mineralType" },
                        licenseNumber: { $first: "$licenseNumber" },
                        TINNumber: { $first: "$TINNumber" },
                        companyRepresentative: { $first: "$companyRepresentative" },
                        representativePhoneNumber: { $first: "$representativePhoneNumber" }
                    }
                },
                // {
                //     $limit: 2
                // }
            ]
        )
        result.push({mineralType: model, entries});
    }

    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    result
                }
            }
        )
    ;
})