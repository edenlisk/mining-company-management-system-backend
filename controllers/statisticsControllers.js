const { getModel } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.detailedStock = catchAsync(async (req, res, next) => {
    const Entry = getModel(req.params.model);
    const detailedStock = [];
    if (req.params.model === "coltan" || req.params.model === "cassiterite" || req.params.model === "wolframite") {
        // TODO 16: CHANGE STATUS
        const entries = await Entry.find({output: {$elemMatch: {status: "in progress", cumulativeAmount: {$gt: 0}}}});
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
                        index: entries.indexOf(entry),
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
                    index: entries.indexOf(entry),
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