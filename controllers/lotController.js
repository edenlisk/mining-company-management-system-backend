const Lot = require('../models/lotModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const fs = require("fs");
const imagekit = require("../utils/imagekit");
const exifreader = require("exifreader");


const lotController = {

    createAndUpdateLots: catchAsync(async (req, res) => {
        const { lots, model } = req.body;
        await Promise.all(lots.map(async lot => {
            if (lot._id) {
                const existingLot = await Lot.findById(lot._id);
                if (existingLot) {
                    if (lot.weightIn) {
                        if (parseFloat(lot.weightIn) !== existingLot.weightIn) existingLot.weightIn = lot.weightIn;
                    }
                    if (lot.weightOut) {
                        if (parseFloat(lot.weightOut) !== existingLot.weightOut) existingLot.weightOut = lot.weightOut;
                    }
                    if (lot.mineralGrade) {
                        if (parseFloat(lot.mineralGrade) !== existingLot.mineralGrade) existingLot.mineralGrade = lot.mineralGrade;
                    }
                    if (lot.pricingGrade) {
                        if (lot.pricingGrade !== existingLot.pricingGrade) existingLot.pricingGrade = lot.pricingGrade;
                    }
                    if (lot.ASIR) {
                        if (parseFloat(lot.ASIR) !== existingLot.ASIR) existingLot.ASIR = lot.ASIR;
                    }
                    if (lot.sampleIdentification) {
                        if (lot.sampleIdentification !== existingLot.sampleIdentification) existingLot.sampleIdentification = lot.sampleIdentification;
                    }
                    if (lot.USDRate) {
                        if (parseFloat(lot.USDRate) !== existingLot.USDRate) existingLot.USDRate = lot.USDRate;
                    }
                    if (lot.nonSellAgreement) {
                        if (lot.nonSellAgreement?.weight !== existingLot.nonSellAgreement.weight) {
                            if (parseFloat(lot.nonSellAgreement?.weight) > 0) {
                                existingLot.nonSellAgreement.weight = existingLot.weightOut;
                                existingLot.nonSellAgreement.date = new Date();
                            } else if (parseFloat(lot.nonSellAgreement?.weight) === 0) {
                                existingLot.nonSellAgreement.weight = 0;
                                existingLot.nonSellAgreement.date = null;
                            }
                        }
                    }
                    if (lot.comment) {
                        if (lot.comment !== existingLot.comment) existingLot.comment = lot.comment;
                    }
                    // SPECIFIC FIELDS
                    // 1. COLTAN
                    if (lot.tantal) {
                        if (parseFloat(lot.tantal) !== existingLot.tantal) existingLot.tantal = lot.tantal;
                    }
                    if (lot.niobium) {
                        if (parseFloat(lot.niobium) !== existingLot.niobium) existingLot.niobium = lot.niobium;
                    }
                    if (lot.iron) {
                        if (parseFloat(lot.iron) !== existingLot.iron) existingLot.iron = lot.iron;
                    }
                    // 2. CASSITERITE
                    if (lot.londonMetalExchange) {
                        if (lot.londonMetalExchange !== existingLot.londonMetalExchange) existingLot.londonMetalExchange = lot.londonMetalExchange;
                    }
                    if (lot.treatmentCharges) {
                        if (lot.treatmentCharges !== existingLot.treatmentCharges) existingLot.treatmentCharges = lot.treatmentCharges;
                    }
                    // 3. WOLFRAMITE
                    if (lot.metricTonUnit) {
                        if (lot.metricTonUnit !== existingLot.metricTonUnit) existingLot.metricTonUnit = lot.metricTonUnit;
                    }
                    if (["lithium", "beryllium"].includes(model)) {
                        if (lot.pricePerUnit) {
                            if (parseFloat(lot.pricePerUnit) !== existingLot.pricePerUnit) existingLot.pricePerUnit = lot.pricePerUnit;
                        }
                    }
                    await existingLot.save({validateModifiedOnly: true});
                }
            } else {
                return Lot.create(
                    {
                        entry: lot.entry,
                        docModel: lot.docModel,
                        weightIn: parseFloat(lot.weightIn),
                        lotNumber: parseFloat(lot.lotNumber),
                        weightOut: parseFloat(lot.weightOut)
                    }
                );
            }
        }))
        res
            .status(201)
            .json(
                {
                    success: true
                }
            )
        ;
    }),

    updateLot: catchAsync(async (req, res, next) => {
        const existingLot = await Lot.findById(req.params.lotId);
        if (!existingLot) return next(new AppError("Unable to find lot!", 400));
        const { lot } = req.body;
        if (req.files) {
            const filePromises = req.files.map(async (file) => {
                const fileData = fs.readFileSync(file.path);
                const response = await imagekit.upload({
                    file: fileData,
                    fileName: `${existingLot.entry?.beneficiary}-${existingLot.entry?.supplyDate}-lot-${existingLot.lotNumber}-${file.fieldname}`,
                    folder: `/${existingLot.docModel}`
                });
                if (response) {
                    return new Promise((resolve, reject) => {
                        fs.readFile(file.path, (err, data) => {
                            if (err) {
                                reject(new AppError("Error occurred while processing file"));
                            } else {
                                const tags = exifreader.load(data);
                                const imageDate = tags['CreateDate'];
                                // const lot = entry.output.find(item => parseInt(item.lotNumber) === parseInt(file.fieldname));
                                existingLot.gradeImg.filename = response.name;
                                existingLot.gradeImg.filePath = response.url;
                                existingLot.gradeImg.fileId = response.fileId;
                                if (imageDate) {
                                    existingLot.gradeImg.createdAt = imageDate.description;
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


        if (lot.weightIn) {
            if (parseFloat(lot.weightIn) !== existingLot.weightIn) existingLot.weightIn = lot.weightIn;
        }
        if (lot.weightOut) {
            if (parseFloat(lot.weightOut) !== existingLot.weightOut) existingLot.weightOut = lot.weightOut;
        }
        if (lot.mineralGrade) {
            if (parseFloat(lot.mineralGrade) !== existingLot.mineralGrade) existingLot.mineralGrade = lot.mineralGrade;
        }
        if (lot.pricingGrade) {
            if (lot.pricingGrade !== existingLot.pricingGrade) existingLot.pricingGrade = lot.pricingGrade;
        }
        if (lot.ASIR) {
            if (parseFloat(lot.ASIR) !== existingLot.ASIR) existingLot.ASIR = lot.ASIR;
        }
        if (lot.sampleIdentification) {
            if (lot.sampleIdentification !== existingLot.sampleIdentification) existingLot.sampleIdentification = lot.sampleIdentification;
        }
        if (lot.USDRate) {
            if (parseFloat(lot.USDRate) !== existingLot.USDRate) existingLot.USDRate = lot.USDRate;
        }
        if (lot.nonSellAgreement) {
            if (lot.nonSellAgreement?.weight !== existingLot.nonSellAgreement.weight) {
                if (parseFloat(lot.nonSellAgreement?.weight) > 0) {
                    existingLot.nonSellAgreement.weight = existingLot.weightOut;
                    existingLot.nonSellAgreement.date = new Date();
                } else if (parseFloat(lot.nonSellAgreement?.weight) === 0) {
                    existingLot.nonSellAgreement.weight = 0;
                    existingLot.nonSellAgreement.date = null;
                }
            }
        }
        if (lot.comment) {
            if (lot.comment !== existingLot.comment) existingLot.comment = lot.comment;
        }
        // SPECIFIC FIELDS
        // 1. COLTAN
        if (lot.tantal) {
            if (parseFloat(lot.tantal) !== existingLot.tantal) existingLot.tantal = lot.tantal;
        }
        if (lot.niobium) {
            if (parseFloat(lot.niobium) !== existingLot.niobium) existingLot.niobium = lot.niobium;
        }
        if (lot.iron) {
            if (parseFloat(lot.iron) !== existingLot.iron) existingLot.iron = lot.iron;
        }
        // 2. CASSITERITE
        if (lot.londonMetalExchange) {
            if (lot.londonMetalExchange !== existingLot.londonMetalExchange) existingLot.londonMetalExchange = lot.londonMetalExchange;
        }
        if (lot.treatmentCharges) {
            if (lot.treatmentCharges !== existingLot.treatmentCharges) existingLot.treatmentCharges = lot.treatmentCharges;
        }
        // 3. WOLFRAMITE
        if (lot.metricTonUnit) {
            if (lot.metricTonUnit !== existingLot.metricTonUnit) existingLot.metricTonUnit = lot.metricTonUnit;
        }
        if (["lithium", "beryllium"].includes(req.params.model)) {
            if (lot.pricePerUnit) {
                if (parseFloat(lot.pricePerUnit) !== existingLot.pricePerUnit) existingLot.pricePerUnit = lot.pricePerUnit;
            }
        }
    }),

    deleteLot: catchAsync(async (req, res, next) => {
        const deletedLot = await Lot.findOneAndDelete(req.params.lotId);
        if (!deletedLot) return next(new AppError("Unable to delete lot. Not found", 400));
        res
            .status(200)
            .json(
                {
                    success: true,
                    data: deletedLot
                }
            )
        ;
    })

}


module.exports = lotController;