const PizZip = require("pizzip");
const mongoose = require('mongoose');
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const Supplier = require('../models/supplierModel');
const Settings = require('../models/settingsModel');
const { getModel, getMonthWords, getSixMonthsAgo, getSFDT } = require('../utils/helperFunctions');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const imagekit = require('./imagekit');

const populateSitesCoordinates = (minesites) => {
    let sites_coordinates = "";
    minesites.forEach(site => {
        sites_coordinates += `${site.name} \n Latitude: ${site.coordinates.lat}. \n Longitude: ${site.coordinates.long}. \n`;
    })
    return sites_coordinates;
}

const populateSitesNames = (minesites) => {
    let sites_names = "";
    minesites.forEach(site => {
        sites_names += `${site.name} \n`;
    })
    return sites_names;
}

const populateSiteCodes = (minesites) => {
    let site_codes = "";
    minesites.forEach(site => {
        site_codes += `${site.code} \n`;
    })
    return site_codes;
}

const getProduction = async (model, supplierId, startMonth, endMonth = new Date().toISOString().split('T')[0]) => {
    const {specifiedMonth, sixMonthsAgo} = getSixMonthsAgo(new Date(endMonth).getMonth());
    const Entry = getModel(model.toLowerCase());
    const supplierOverallProduction = await Entry.aggregate(
        [
            {
                $match: {
                    supplierId: new mongoose.Types.ObjectId(supplierId),
                    supplyDate: {
                        $lte: endMonth ? new Date(endMonth) : specifiedMonth, // Last day of the specified month
                        $gt: startMonth ? new Date(startMonth) : sixMonthsAgo // Six months ago from the specified month
                    },
                    mineralType: {$ne: "mixed"}
                }
            },
            {
                $project: {
                    month: { $month: '$supplyDate' },
                    year: { $year: '$supplyDate' },
                    weightIn: 1,
                },
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    totalWeightIn: { $sum: '$weightIn' },
                },
            }
        ]
    )
    const monthMap = {};
    let currentDate = new Date(startMonth ? new Date(startMonth) : sixMonthsAgo);
    while (currentDate < (endMonth ? new Date(endMonth) : specifiedMonth)) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Adjusting for 0-based index
        monthMap[`${currentYear}-${currentMonth}`] = 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    supplierOverallProduction.forEach(result => {
        const { year, month } = result._id;
        monthMap[`${year}-${month}`] = result.totalWeightIn;
    });

    return Object.keys(monthMap).map(key => ({
        _id: {year: parseInt(key.split('-')[0]), month: parseInt(key.split('-')[1])},
        totalWeightIn: monthMap[key],
    }));
}

const getMixedProduction = async (supplierId, startMonth, endMonth = new Date().toISOString().split('T')[0]) => {
    const Entry = getModel("coltan");
    const { specifiedMonth, sixMonthsAgo } = getSixMonthsAgo(new Date(endMonth).getMonth());
    const supplierOverallProduction = await Entry.aggregate(
        [
            {
                $match: {
                    supplierId: new mongoose.Types.ObjectId(supplierId),
                    supplyDate: {
                        $lte: endMonth ? new Date(endMonth) : specifiedMonth, // Last day of the specified month
                        $gt: startMonth ? new Date(startMonth) : sixMonthsAgo // Six months ago from the specified month
                    },
                    mineralType: {$eq: "mixed"}
                }
            },
            {
                $project: {
                    month: { $month: '$supplyDate' },
                    year: { $year: '$supplyDate' },
                    weightIn: 1,
                },
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    totalWeightIn: { $sum: '$weightIn' },
                },
            }
        ]
    )

    const monthMap = {};
    let currentDate = new Date(startMonth ? new Date(startMonth) : sixMonthsAgo);
    while (currentDate < (endMonth ? new Date(endMonth) : specifiedMonth)) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Adjusting for 0-based index
        monthMap[`${currentYear}-${currentMonth}`] = 0;
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    supplierOverallProduction.forEach(result => {
        const { year, month } = result._id;
        monthMap[`${year}-${month}`] = result.totalWeightIn;
    });
    return Object.keys(monthMap).map(key => ({
        _id: {year: parseInt(key.split('-')[0]), month: parseInt(key.split('-')[1])},
        totalWeightIn: monthMap[key],
    }));
}

const uploadFileImageKit = async (file, fileName, folder) => {
    const response = imagekit.upload(
        {
            file,
            fileName,
            folder
        }
    );
    if (response) {
        return response;
    }
}

exports.generate = catchAsync(async (req, res, next) => {
    // Load the docx file as binary content
    const content = fs.readFileSync(
        path.resolve(`${__dirname}/../public/data/templates`, "dd template.docx"),
        "binary"
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    const supplier = await Supplier.findById(req.params.supplierId);
    const models = ["cassiterite", "coltan", "wolframite"];
    const mineralTypes = {
        "mineral_type1": "cassiterite",
        "mineral_type2": "coltan",
        "mineral_type3": "wolframite",
        "mineral_type4": "mixed"
    }
    const sampleObject = {};
    const averageProduction = {
        "cassiterite": null,
        "coltan": null,
        "wolframite": null,
        "mixed": null
    }
    const mixedProduction = await getMixedProduction(req.params.supplierId, req.body.startMonth, req.body.endMonth);
    for (const model of models) {
        const mineralProduction = await getProduction(model, req.params.supplierId, req.body.startMonth, req.body.endMonth);
        let totalWeightIn = 0;
        for (const production of mineralProduction) {
            sampleObject[`month_${mineralProduction.indexOf(production) + 1}`] = getMonthWords(production?._id?.month);
            sampleObject[`mineral_type${models.indexOf(model) + 1}`] = mineralTypes[`mineral_type${models.indexOf(model) + 1}`];
            sampleObject[`month${mineralProduction.indexOf(production) + 1}_type${models.indexOf(model) + 1}`] = production.totalWeightIn;
            totalWeightIn += production?.totalWeightIn;
        }
        if (totalWeightIn > 0) {
            averageProduction[model] = totalWeightIn / (mineralProduction.length * 24);
        } else {
            averageProduction[model] = 0;
        }
    }
    if (mixedProduction.length > 0) {
        let totalWeightIn = 0;
        for (const production of mixedProduction) {
            sampleObject[`month_${mixedProduction.indexOf(production) + 1}`] = getMonthWords(production?._id?.month);
            sampleObject[`mineral_type4`] = mineralTypes[`mineral_type4`];
            sampleObject[`month${mixedProduction.indexOf(production) + 1}_type4`] = production?.totalWeightIn;
            totalWeightIn += production?.totalWeightIn;
        }
        if (totalWeightIn > 0) {
            averageProduction["mixed"] = totalWeightIn / (mixedProduction.length * 24);
        } else {
            averageProduction["mixed"] = 0;
        }
    }
    let productionPerDaySummary = '';
    if (averageProduction) {
        for (const mineralType of Object.keys(averageProduction)) {
            productionPerDaySummary += `${averageProduction[mineralType]?.toFixed(3)} kg/day for ${mineralType}\n`;
        }
    }

    const fileName = `${req.body.date_of_report ? req.body.date_of_report : new Date().toISOString().split('T')[0]} iTSCi Template Due Diligence ${supplier.companyName}.docx`;


    const currentDate = new Date();
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    const buffer = doc.render({
        sites_coordinates: populateSitesCoordinates(supplier?.mineSites),
        name_of_sites: populateSitesNames(supplier?.mineSites),
        code_of_sites: populateSiteCodes(supplier?.mineSites),
        ...req.body,
        sites_district: supplier?.address?.district,
        sites_sector: supplier?.address?.sector,
        sites_cell: supplier?.address?.sector,
        ...sampleObject,
        company_license_number: supplier?.licenseNumber,
        company_visited: supplier?.companyName,
        sites_visited: populateSitesNames(supplier?.mineSites),
        number_of_minesites: supplier?.mineSites?.length,
        number_of_minesites_visited: supplier?.mineSites?.length,
        date_of_report: new Date().toISOString().split('T')[0],
        date_of_visit: twoDaysAgo?.toISOString().split('T')[0],
        production_per_day_observations: productionPerDaySummary,
    }).getZip().generate({type: "arraybuffer", compression: "DEFLATE",})




    const year = (new Date()).getFullYear();
    const month = getMonthWords((new Date()).getMonth());


    let fileUrl = "";
    let filePath = "";
    let fileId = "";

    if (buffer && month && year) {
        const response = await uploadFileImageKit(Buffer.from(buffer), fileName, `/dd_reports/${year}/${month}`);
        if (response) {
            fileUrl = response.url;
            fileId = response.fileId
            filePath = response.filePath
        }
    }

    if (!fileUrl) return next(new AppError("Something went wrong while generating dd report", 400));
    await getSFDT(Buffer.from(buffer), res, next, {fileId, filePath, fileUrl});
})

exports.generateLabReport = async (entry, lot, user) => {
    const content = fs.readFileSync(
        path.resolve(`${__dirname}/../public/data/templates`, "lab report.docx"),
        "binary"
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const settings = await Settings.findOne();
    const reportInfo = {
        weightOut: lot?.weightOut,
        supplierName: entry?.companyName,
        supplyDate: entry?.supplyDate?.toISOString().split('T')[0],
        dateOfReceipt: entry?.supplyDate?.toISOString().split('T')[0],
        mineralType: entry?.mineralType?.toUpperCase(),
        coltanContent: entry?.mineralType !== "coltan" ? "0.0" : lot?.mineralGrade ,
        cassiteriteContent: entry?.mineralType !== "cassiterite" ? "0.0" : lot?.mineralGrade,
        niobiumContent: entry?.mineralType !== "coltan" ? "0.0" : lot?.niobium,
        wolframiteContent: entry?.mineralType !== "wolframite" ? "0.0" : lot?.mineralGrade,
        ironContent: entry?.mineralType !== "coltan" ? "0.0" : lot?.iron,
        mainMaterial: entry?.mineralType?.toUpperCase(),
        mainMaterialContent: lot?.mineralGrade,
        generatedBy: user?.username,
        nameOfCompany: settings?.nameOfCompany,
    }
    return doc.render({
        ...reportInfo,
    }).getZip().generate({type: "arraybuffer", compression: "DEFLATE",});
}

exports.generateForwardNote = async (shipment) => {
    const content = fs.readFileSync(
        path.resolve(`${__dirname}/../public/data/templates`, "forward-note.docx"),
        "binary"
    );
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    const settings = await Settings.findOne();
    const forwardNoteInfo = {
        shipment_number: shipment?.iTSCiShipmentNumber,
        mineral_type: shipment?.model.toUpperCase(),
        gross_weight: shipment?.netWeight + shipment?.dustWeight + shipment?.sampleWeight,
        name_of_buyer: shipment?.buyerName,
        address_of_processor: settings?.address.sector + ", " + settings?.address?.district + ", " + settings?.address?.province,
        name_of_processor: settings?.nameOfCompany,
    }

    const buffer = doc.render({
        ...forwardNoteInfo,
    }).getZip().generate({type: "arraybuffer", compression: "DEFLATE",});

    const response = await uploadFileImageKit(Buffer.from(buffer), `${shipment.shipmentNumber} - FORWARD NOTE.docx`, `/shipments/${shipment.shipmentNumber}`);
    if (response) {
        shipment.containerForwardNote.url = response.url;
        shipment.containerForwardNote.fileId = response.fileId;
        await shipment.save();
        return {
            response,
            buffer
        }
    }
}
