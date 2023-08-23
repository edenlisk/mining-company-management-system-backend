const { getModel } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
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
                        supplierName: entry.supplierName,
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