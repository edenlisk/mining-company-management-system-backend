const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const { fonts, getMonthWords } = require('../utils/helperFunctions');
const imagekit = require('../utils/imagekit');

class Invoice {
    constructor(processor, supplier, invoiceInfo) {
        this.processor = processor;
        this.supplier = supplier;
        this.invoiceInfo = invoiceInfo;
        this.dd = null;
        this.filename = `${this.supplier.companyName}_${this.invoiceInfo.invoiceNo}_${this.invoiceInfo.dateOfIssue}_${this.invoiceInfo.mineralsSupplied}.pdf`;
    }

    populateDoc() {
        this.dd = {
            pageOrientation: "landscape",
            content: [
                {
                    columns: [
                        // {
                        //     // image:
                        //         // 'data:image/png;base64,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',
                        //     width: 150,
                        // },
                        [
                            {
                                text: 'Receipt',
                                color: '#333333',
                                width: '*',
                                fontSize: 28,
                                bold: true,
                                alignment: 'right',
                                margin: [0, 0, 0, 15],
                            },
                            {
                                stack: [
                                    {
                                        columns: [
                                            {
                                                text: 'Receipt No.',
                                                color: '#aaaaab',
                                                bold: true,
                                                width: '*',
                                                fontSize: 12,
                                                alignment: 'right',
                                            },
                                            {
                                                text: '00001',
                                                bold: true,
                                                color: '#333333',
                                                fontSize: 12,
                                                alignment: 'right',
                                                width: 100,
                                            },
                                        ],
                                    },
                                    {
                                        columns: [
                                            {
                                                text: 'Date Issued',
                                                color: '#aaaaab',
                                                bold: true,
                                                width: '*',
                                                fontSize: 12,
                                                alignment: 'right',
                                            },
                                            {
                                                text: `${this.invoiceInfo.dateOfIssue}`,
                                                bold: true,
                                                color: '#333333',
                                                fontSize: 12,
                                                alignment: 'right',
                                                width: 100,
                                            },
                                        ],
                                    },
                                    {
                                        columns: [
                                            {
                                                text: 'Status',
                                                color: '#aaaaab',
                                                bold: true,
                                                fontSize: 12,
                                                alignment: 'right',
                                                width: '*',
                                            },
                                            {
                                                text: `${this.invoiceInfo.paymentStatus}`,
                                                bold: true,
                                                fontSize: 14,
                                                alignment: 'right',
                                                color: 'green',
                                                width: 100,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Processor',
                            color: '#aaaaab',
                            bold: true,
                            fontSize: 14,
                            alignment: 'left',
                            margin: [0, 20, 0, 5],
                        },
                        {
                            text: 'Supplier',
                            color: '#aaaaab',
                            bold: true,
                            fontSize: 14,
                            alignment: 'left',
                            margin: [0, 20, 0, 5],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: `${this.processor.representative} \n ${this.processor.companyName}`,
                            bold: true,
                            color: '#333333',
                            alignment: 'left',
                        },
                        {
                            text: `${this.supplier.beneficiary} \n ${this.supplier.companyName}`,
                            bold: true,
                            color: '#333333',
                            alignment: 'left',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Address',
                            color: '#aaaaab',
                            bold: true,
                            margin: [0, 7, 0, 3],
                        },
                        {
                            text: 'Address',
                            color: '#aaaaab',
                            bold: true,
                            margin: [0, 7, 0, 3],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: `${this.processor.province} \n ${this.processor.district} \n   ${this.processor.sector}`,
                            style: 'invoiceBillingAddress',
                        },
                        {
                            text: `${this.supplier.address.province} \n ${this.supplier.address.district} \n   ${this.supplier.address.sector}`,
                            style: 'invoiceBillingAddress',
                        },
                    ],
                },
                '\n\n',
                {
                    width: '100%',
                    alignment: 'center',
                    text: `Invoice No. ${this.invoiceInfo.invoiceNo}`,
                    bold: true,
                    margin: [0, 10, 0, 10],
                    fontSize: 15,
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function(i, node) {
                            return 1;
                        },
                        vLineWidth: function(i, node) {
                            return 1;
                        },
                        hLineColor: function(i, node) {
                            if (i === 1 || i === 0) {
                                return '#bfdde8';
                            }
                            return '#eaeaea';
                        },
                        vLineColor: function(i, node) {
                            return '#eaeaea';
                        },
                        hLineStyle: function(i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function(i, node) {
                            return 10;
                        },
                        paddingRight: function(i, node) {
                            return 10;
                        },
                        paddingTop: function(i, node) {
                            return 2;
                        },
                        paddingBottom: function(i, node) {
                            return 2;
                        },
                        fillColor: function(rowIndex, node, columnIndex) {
                            return '#fff';
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: [20, '*', '*', '*', '*', '*', '*', 80],
                        body: this.invoiceInfo.invoiceDescription
                    },
                },
                '\n',
                '\n\n',
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function(i, node) {
                            return 1;
                        },
                        vLineWidth: function(i, node) {
                            return 1;
                        },
                        hLineColor: function(i, node) {
                            return '#eaeaea';
                        },
                        vLineColor: function(i, node) {
                            return '#eaeaea';
                        },
                        hLineStyle: function(i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function(i, node) {
                            return 10;
                        },
                        paddingRight: function(i, node) {
                            return 10;
                        },
                        paddingTop: function(i, node) {
                            return 3;
                        },
                        paddingBottom: function(i, node) {
                            return 3;
                        },
                        fillColor: function(rowIndex, node, columnIndex) {
                            return '#fff';
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto'],
                        body: [
                            [
                                {
                                    text: 'Payment Subtotal ($)',
                                    border: [false, true, false, true],
                                    alignment: 'right',
                                    margin: [0, 5, 0, 5],
                                },
                                {
                                    border: [false, true, false, true],
                                    text: `${this.invoiceInfo.paymentTotal}`,
                                    alignment: 'right',
                                    fillColor: '#f5f5f5',
                                    margin: [0, 5, 0, 5],
                                },
                            ],
                            [
                                {
                                    text: 'RMA fees ($)',
                                    border: [false, false, false, true],
                                    alignment: 'right',
                                    margin: [0, 5, 0, 5],
                                },
                                {
                                    text: `${this.invoiceInfo.totalRMAFee}`,
                                    border: [false, false, false, true],
                                    fillColor: '#f5f5f5',
                                    alignment: 'right',
                                    margin: [0, 5, 0, 5],
                                },
                            ],
                            [
                                {
                                    text: 'Total Amount ($)',
                                    bold: true,
                                    fontSize: 20,
                                    alignment: 'right',
                                    border: [false, false, false, true],
                                    margin: [0, 5, 0, 5],
                                },
                                {
                                    text: `${this.invoiceInfo.paymentTotal - this.invoiceInfo.totalRMAFee}`,
                                    bold: true,
                                    fontSize: 20,
                                    alignment: 'right',
                                    border: [false, false, false, true],
                                    fillColor: '#f5f5f5',
                                    margin: [0, 5, 0, 5],
                                },
                            ],
                        ],
                    },
                },
                '\n\n',
                {
                    text: 'EXTRA NOTES',
                    style: 'notesTitle',
                },
                {
                    text: `${this.invoiceInfo.extraNotes}`,
                    style: 'notesText',
                },
            ],
            styles: {
                notesTitle: {
                    fontSize: 10,
                    bold: true,
                    margin: [0, 50, 0, 3],
                },
                notesText: {
                    fontSize: 10,
                },
            },
            defaultStyle: {
                columnGap: 20,
                font: "Helvetica"
                //font: 'Quicksand',
            },
        };

        const formatPaymentHistory = this.invoiceInfo.paymentHistory.map(table => {
            return {
                layout: {
                    defaultBorder: false,
                    hLineWidth: function(i, node) {
                        return 1;
                    },
                    vLineWidth: function(i, node) {
                        return 1;
                    },
                    hLineColor: function(i, node) {
                        if (i === 1 || i === 0) {
                            return '#bfdde8';
                        }
                        return '#eaeaea';
                    },
                    vLineColor: function(i, node) {
                        return '#eaeaea';
                    },
                    hLineStyle: function(i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function(i, node) {
                        return 10;
                    },
                    paddingRight: function(i, node) {
                        return 10;
                    },
                    paddingTop: function(i, node) {
                        return 2;
                    },
                    paddingBottom: function(i, node) {
                        return 2;
                    },
                    fillColor: function(rowIndex, node, columnIndex) {
                        return '#fff';
                    },
                },
                table: {
                    headerRows: 1,
                    widths: [ '*', '*', '*', '*', '*', '*' ],
                    body: table,
                },
            }
        })

        this.dd.content = this.dd.content.concat(formatPaymentHistory);
    }

    async saveDownload(res) {
        const InvoiceModel = require('../models/invoiceModel');
        const printer = new PdfPrinter(fonts);
        const pdfDoc = printer.createPdfKitDocument(this.dd);
        // const year = (new Date()).getFullYear();
        // const month = getMonthWords((new Date()).getMonth());
        const invoiceDoc = await InvoiceModel.findById(this.invoiceInfo.invoiceId);
        if (invoiceDoc) {
            if (invoiceDoc.invoiceFile?.fileId) {
                await imagekit.deleteFile(invoiceDoc.invoiceFile.fileId, err => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
        const pdfBuffer = await new Promise((resolve) => {
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
        });



        // pdfDoc.pipe(fs.createWriteStream(`${this.supplier.companyName} - ${this.invoiceInfo.invoiceNumber}.pdf`));
        // pdfDoc.end();

        const response = await imagekit.upload({
            file: pdfBuffer,
            fileName: `${this.supplier.companyName} - ${this.invoiceInfo.invoiceNumber}.pdf`,
            folder: `invoices`,
        })
        if (response) {
            invoiceDoc.invoiceFile.fileId = response.fileId;
            invoiceDoc.invoiceFile.url = response.url;
            await invoiceDoc.save();
            // fs.unlink(`${this.supplier.companyName} - ${this.invoiceInfo.invoiceNumber}.pdf`, err => {
            //   if (err) {
            //       console.log(err);
            //   } else {
            //       console.log('File deleted successfully');
            //   }
            // })
        }



        // const filePath = `${__dirname}/../public/data/Invoices/${this.supplier.companyName}/${year}/${month}`;
        // if (!fs.existsSync(filePath)) {
        //     fs.mkdir(filePath, {recursive: true}, err => {
        //         if (err) {
        //             console.log(err);
        //         }
        //     });
        // }
        // pdfDoc.pipe(fs.createWriteStream(path.resolve(filePath, this.filename)));
        // pdfDoc.end();
        res
            .status(201)
            .json(
                {
                    status: "Success",
                    data: {
                        invoiceFile: invoiceDoc.invoiceFile.url,
                        invoiceFileId: invoiceDoc.invoiceFile.fileId,
                    }
                }
            )
        ;
    }
}


module.exports = Invoice;