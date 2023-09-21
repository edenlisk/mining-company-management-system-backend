const multer = require('multer');
const PdfPrinter = require('pdfmake');
const path = require('path');
const Shipment = require("../models/shipmentModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {getModel, fonts} = require('../utils/helperFunctions');
const fs = require('fs');
// const { multerFilter, multerStorage } = require('../utils/helperFunctions');


exports.getAllshipments = catchAsync(async (req, res, next) => {
    const shipments = await Shipment.find();
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    shipments
                }
            }
        )
    ;
})

exports.createShipment = catchAsync(async (req, res, next) => {
    await Shipment.create(
        {
            entries: req.body.entries,
            shipmentPrice: req.body.shipmentPrice,
            shipmentGrade: req.body.shipmentGrade,
            totalShipmentQuantity: req.body.totalShipmentQuantity,
            buyerId: req.body.buyerId,
            shipmentSamplingDate: req.body.shipmentSamplingDate,
            shipmentContainerLoadingDate: req.body.shipmentContainerLoadingDate,
            averageGrade: req.body.averageGrade,
            averagePrice: req.body.averagePrice,
            model: req.body.model
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

exports.downloadCertificate = catchAsync(async (req, res, next) => {

})

exports.getOneShipment = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) return next(new AppError("The selected shipment no longer exists", 400));
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    shipment
                }
            }
        )
    ;
})

exports.updateShipment = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) return next(new AppError("Selected shipment no longer exists!", 400));
    if (req.files) {
        for (const file of req.files) {
            shipment[file.fieldname] = file.originalname;
        }
    }
    if (req.body.entries) shipment.entries = req.body.entries;
    if (req.body.buyerId) shipment.buyerId = req.body.buyerId;
    if (req.body.shipmentGrade) shipment.shipmentGrade = req.body.shipmentGrade;
    if (req.body.shipmentPrice) shipment.shipmentPrice = req.body.shipmentPrice;
    if (req.body.shipmentNumber) shipment.shipmentNumber = req.body.shipmentNumber;
    if (req.body.shipmentSamplingDate) shipment.shipmentSamplingDate = req.body.shipmentSamplingDate;
    if (req.body.shipmentContainerLoadingDate) shipment.shipmentContainerLoadingDate = req.body.shipmentContainerLoadingDate;
    if (req.body.totalShipmentQuantity) shipment.totalShipmentQuantity = req.body.totalShipmentQuantity;
    if (req.body.averageGrade) shipment.averageGrade = req.body.averageGrade;
    if (req.body.averagePrice) shipment.averagePrice = req.body.averagePrice;
    await shipment.save({validateModifiedOnly: true});
    res
        .status(202)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.deleteShipment = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
    if (!shipment) return next(new AppError("Selected shipment no longer exists!", 400));
    res
        .status(204)
        .json(
            {
                status: "Success"
            }
        )
    ;
})

exports.shipmentReport = catchAsync(async (req, res, next) => {
    const shipment = await Shipment.findOne({_id: req.params.shipmentId});
    const tableData = [
        [
            {text: "Supply date", margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: 'Supplier name', margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: "Lot No", margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: 'Weight out', margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: "Exported amount", margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: "Balance", margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
            {text: "Grade", margin: [0, 5, 0, 2], fillColor: '#93c6e8'},
        ]
    ];

    const populateDoc = async (tableData) => {
        for (const item of shipment.entries) {
            const Entry = getModel(shipment.model);
            const entry = await Entry.findById(item.entryId);
            const lot = entry.output.find(value => value.lotNumber === item.lotNumber);
            tableData.push([
                {text: entry.supplyDate.toISOString().split('T')[0]},
                {text: entry.companyName},
                {text: item.lotNumber},
                {text: lot.weightOut},
                {text: item.quantity},
                {text: lot.cumulativeAmount},
                {text: lot.mineralGrade}
            ])
        }
        return tableData;
    }

    const docDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [40, 50, 40, 50],
        content: [
            {
                text: `Shipment details with shipment number: ${shipment.shipmentNumber}`,
                alignment: 'left',
                margin: [30, 20, 30, 20],
                fontSize: 25
            },
            {
                table: {
                    width: ['*', '*', '*', 'auto'],
                    body: await populateDoc(tableData),
                },
                alignment: 'center',
            }
        ],
        defaultStyle: {
            font: 'Helvetica',
            fontSize: 20
        }
    };
    const printer = new PdfPrinter(fonts);

    // SAVE THE DOCUMENT ON THE FILE SYSTEM
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    // 1. create structure of the report
    // 2. populate data into report
    // 3. send report back to client
    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
})

exports.shipmentQuarterReport = catchAsync(async (req, res, next) => {
    // const shipments = await Shipment.aggregate(
    //     [
    //         {
    //             $match: {
    //                 model: req.body.model,
    //                 createdAt: {
    //                     $gte: new Date(req.body.startDate),
    //                     $lte: new Date(req.body.endDate)
    //                 }
    //             }
    //         },
    //         {
    //             $unwind: "$entries"
    //         },
    //         {
    //             $group: {
    //                 _id: "$entries.entryId",
    //                 balance: { $sum: "$entries.quantity" }
    //             }
    //         }
    //     ]
    // )

    const shipmentRawData = await Shipment.find(
        {
            model: req.body.model,
            createdAt: {
                $gte: new Date(req.body.startDate),
                $lte: new Date(req.body.endDate)
            }
        })
    const reportRawData = [];

    const Entry = getModel(req.body.model);
    for (const shipmentRawDatum of shipmentRawData) {
        if (shipmentRawDatum.entries) {
            const grouped = shipmentRawDatum.entries.reduce((result, item) => {
                const {entryId, quantity, _id, lotNumber} = item;
                if (!result[entryId]) {
                    result[entryId] = {
                        entryId,
                        quantitySum: 0,
                        items: [],
                    };
                }
                result[entryId].quantitySum += item.quantity;
                result[entryId].items.push({entryId, quantity, _id, lotNumber});
                return result;
            }, {});
            const singleShipment = [];
            for (const key of Object.keys(grouped)) {
                const items = grouped[key];
                const entry = await Entry.findById(key);
                if (entry) {
                    singleShipment.push(
                        {
                            supplyDate: entry.supplyDate.toISOString().split('T')[0],
                            companyName: entry.companyName,
                            weightIn: entry.weightIn,
                            quantity: items.quantitySum,
                            // TODO 22: USE CORRECT CONCENTRATION, PRICE, TOTAL AMOUNT VALUES
                            price: '',
                            concentration: '',
                            totalAmount: ''
                        }
                    )
                }
            }
            reportRawData.push(singleShipment);
        }
    }

    const tableHeading = [
        {text: "DATE", margin: [0, 5, 0, 2], fontSize: 15},
        {text: 'COMPANY NAMES', margin: [0, 5, 0, 2], fontSize: 15},
        {text: "WEIGHT IN", margin: [0, 5, 0, 2], fontSize: 15},
        {text: 'QUANTITY (KG)', margin: [0, 5, 0, 2], fontSize: 15},
        {text: "PRICE", margin: [0, 5, 0, 2], fontSize: 15},
        {text: "CONC.(%)", margin: [0, 5, 0, 2], fontSize: 15},
        {text: "TOTAL AMOUNT (USD)", margin: [0, 5, 0, 2], fontSize: 15},
    ];

    const docDefinition = {
        pageOrientation: "landscape",
        pageMargins: [40, 50, 40, 50],
        content: [
            {
                text: `OBJECT: DETAILED REPORT OF THE - TERM MINERAL SALES, WEIGHT, GRADE, PRICE AND SUPPLIERS`,
                alignment: 'center',
                margin: [30, 20, 30, 20],
                fontSize: 25
            },
        ],
        defaultStyle: {
            font: 'Helvetica',
            fontSize: 20
        }
    }

    const populateDoc = () => {
        const tableHead = [tableHeading];
        for (const shipmentTable of reportRawData) {
            for (const row of shipmentTable) {
                const singleRow = [
                    {text: row.supplyDate},
                    {text: row.companyName},
                    {text: parseInt(row.weightIn)},
                    {text: parseInt(row.quantity)},
                    {text: parseFloat(row.price)},
                    {text: parseFloat(row.concentration)},
                    {text: row.totalAmount},
                ]
                tableHead.push(singleRow);
            }
            docDefinition.content.push(
                {
                    table: {
                        width: ['*', '*', '*', '*', "*", '*', "auto"],
                        body: tableHead,
                    },
                    alignment: 'center',
                },
            )
        }
    }
    populateDoc();

    const printer = new PdfPrinter(fonts);
    // SAVE THE DOCUMENT ON THE FILE SYSTEM
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    // 1. create structure of the report
    // 2. populate data into report
    // 3. send report back to client
    // console.log('weeeeeeeeeeeeeeeeeeee')
    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
})


const multerStorage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, `${__dirname}/../public/data/shipment/${req.params.shipmentId}`);
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
    const allowExtension = ['.doc', '.docx', '.pdf'];
    if (allowExtension.includes(fileExtension.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new AppError("Not a .doc, .docx, or .pdf selected", 400), false);
    }
}

const upload = multer(
    {
        storage: multerStorage,
        fileFilter: multerFilter
    }
)

exports.uploadCertificates = upload;