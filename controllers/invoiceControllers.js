const Invoice = require('../models/invoiceModel');
const Settings = require('../models/settingsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const INVOICE = require('../utils/invoiceTemplater');


exports.getAllInvoices = catchAsync(async (req, res, next) => {
    const result = new APIFeatures(Invoice.find({}), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    ;
    const invoices = await result.mongooseQuery;
    res
        .status(200)
        .json(
            {
                status: "Success",
                data: {
                    invoices
                }
            }
        )
    ;
})

exports.generateInvoice = catchAsync(async (req, res, next) => {
    const invoicedoc = await Invoice.create(
        {
            dateOfIssue: req.body.dateOfIssue,
            invoiceNo: req.body.invoiceNo,
            items: req.body.items,
            beneficiary: req.body.beneficiary,
            supplierCompanyName: req.body.supplierCompanyName,
            supplierAddress: req.body.supplierAddress,
            // processorEmail: req.body.processorEmail,
            // supplierEmail: req.body.supplierEmail,
            processorCompanyName: req.body.processorCompanyName,
            mineralsSupplied: req.body.mineralsSupplied,
            extraNotes: req.body.extraNotes,
            paymentId: req.body.paymentId,
            supplierId: req.body.supplierId
        }
    )
    const settings = await Settings.findOne();
    const invoiceDescription = [
        [
            {
                text: "Date",
                fillColor: '#eaf2f5',
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
            },
            {
                text: 'Description',
                fillColor: '#eaf2f5',
                border: [false, true, false, true],
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
            {
                text: "#",
                fillColor: '#eaf2f5',
                border: [false, true, false, true],
                margin: [0, 3, 0, 3],
            },
            {
                text: 'Quantity(kg)',
                border: [false, true, false, true],
                alignment: 'right',
                fillColor: '#eaf2f5',
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
            {
                text: 'Conc.(%)',
                border: [false, true, false, true],
                alignment: 'right',
                fillColor: '#eaf2f5',
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
            {
                text: 'Price per unit($)',
                border: [false, true, false, true],
                alignment: 'right',
                fillColor: '#eaf2f5',
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
            {
                text: 'Total($)',
                border: [false, true, false, true],
                alignment: 'right',
                fillColor: '#eaf2f5',
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
            {
                text: 'RMA Fee($)',
                border: [false, true, false, true],
                alignment: 'right',
                fillColor: '#eaf2f5',
                margin: [0, 5, 0, 5],
                textTransform: 'uppercase',
            },
        ],

        // [
        //     {
        //         text: 'Item 2',
        //         border: [false, false, false, true],
        //         margin: [0, 5, 0, 5],
        //         alignment: 'left',
        //     },
        //     {
        //         border: [false, false, false, true],
        //         text: '2767.4',
        //         fillColor: '#f5f5f5',
        //         alignment: 'right',
        //         margin: [0, 5, 0, 5],
        //     },
        //     {
        //         border: [false, false, false, true],
        //         text: 23.4,
        //         fillColor: '#f5f5f5',
        //         alignment: 'right',
        //         margin: [0, 5, 0, 5],
        //     },
        //     {
        //         border: [false, false, false, true],
        //         text: 25.6,
        //         fillColor: '#f5f5f5',
        //         alignment: 'right',
        //         margin: [0, 5, 0, 5],
        //     },
        //     {
        //         border: [false, false, false, true],
        //         text: 1743.8,
        //         fillColor: '#f5f5f5',
        //         alignment: 'right',
        //         margin: [0, 5, 0, 5],
        //     },
        // ],
    ]
    if (invoicedoc) {
        let paymentTotal = 0;
        let totalRMAFee = 0;
        for (const item of invoicedoc.items) {
            paymentTotal += item.amount;
            totalRMAFee += item.rmaFee;
            invoiceDescription.push(
                [
                    {
                        text: item.supplyDate,
                        border: [false, false, false, true],
                        margin: [0, 5, 0, 5],
                        alignment: 'left',
                    },
                    {
                        text: item.itemName,
                        border: [false, false, false, true],
                        margin: [0, 5, 0, 5],
                        alignment: 'left',
                    },
                    {
                        text: item.lotNumber,
                        border: [false, false, false, true],
                        margin: [0, 3, 0, 3],
                        alignment: 'left',
                    },
                    {
                        text: item.quantity,
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        alignment: 'right',
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: item.concentration,
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        alignment: 'right',
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: item.pricePerUnit,
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        alignment: 'right',
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: item.amount,
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        alignment: 'right',
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: item.rmaFee,
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        alignment: 'right',
                        margin: [0, 5, 0, 5],
                    },
                ],
            )
        }
        const processor = {
            representative: settings.representative,
            companyName: settings.nameOfCompany,
            ...settings.address
        }
        const supplier = {
            companyName: invoicedoc.supplierCompanyName,
            beneficiary: invoicedoc.beneficiary,
            address: {
                ...invoicedoc.supplierAddress,
            }
        }
        const invoiceInfo = {
            invoiceNo: invoicedoc.invoiceNo,
            mineralsSupplied: invoicedoc.mineralsSupplied.join(', '),
            dateOfIssue: req.body.dateOfIssue,
            paymentStatus: "",
            extraNotes: invoicedoc.extraNotes,
            invoiceDescription,
            paymentTotal,
            totalRMAFee
        }
        const invoice = new INVOICE(processor, supplier, invoiceInfo);
        invoice.populateDoc();
        invoice.saveDownload(true, res);
    } else {
        return next(new AppError("weeeeee"))
    }
    // res
    //     .status(200)
    //     .json(
    //         {
    //             status: "Success",
    //         }
    //     )
    // ;

})

