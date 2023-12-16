const fs = require('fs');
const mongoose = require('mongoose');
const { getModel } = require('../utils/helperFunctions');
const Buyer = require('./buyerModel');
const AppError = require('../utils/appError');

const shipmentSchema = new mongoose.Schema(
    {
        entries: {
            type: [
                {
                    entryId: mongoose.Schema.Types.ObjectId,
                    quantity: Number,
                    lotNumber: Number
                }
            ],
            required: [true, "Please provide entries"],
        },
        shipmentGrade: {
            type: Number,
            // required: [true, "Please provide average grade of shipment"],
            validate: {
                validator: (elem) => {
                    return elem >= 0.0;
                },
                message: "Shipment grade can't be negative number"
            },
            default: null
        },
        shipmentPrice: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0.0;
                },
                message: "Shipment price can't be negative number"
            },
            default: null
        },
        shipmentMinerals: {
            type: String,
            default: null
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buyer',
            default: null
            // required: [true, "Please select the buyer"],
            // immutable: true
        },
        shipmentSamplingDate: {
            type: Date,
            default: null
        },
        shipmentContainerLoadingDate: {
            type: String,
            default: null
        },
        buyerName: {
            type: String,
            default: null
        },
        netWeight: {
            type: Number,
            default: null
        },
        averageGrade: {
            type: Number,
            default: null
        },
        averagePrice: {
            type: Number,
            default: null
        },
        shipmentNumber: {
            type: String,
            unique: true,
            required: [true, "Please provide shipment number"],
        },
        analysisCertificate: {
            type: String,
        },
        containerForwardNote: {
            fileId: {
                type: String,
                default: null,
            },
            url: {
                type: String,
                default: null,
            }
        },
        certificateOfOrigin: {
            type: String,
        },
        rmbIcglrCertificate: {
            fileId: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        model: String,
        tagListFile: {
            fileId: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        negociantTagListFile: {
            fileId: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        packingListFile: {
            fileId: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        iTSCiShipmentNumber: {
            type: String,
            default: null
        },
        sampleWeight: {
            type: Number,
            default: null
        },
        dustWeight: {
            type: Number,
            default: null
        },
        shipmentDate: {
            type: Date,
            default: null
        },
    },
    {timestamps: true}
)

// TODO 24: REPLACE TOTAL SHIPMENT QUANTITY WITH NET WEIGHT -----> DONE


// TODO 8: PRE `SAVE` FOR SHIPMENT

shipmentSchema.pre('save', async function (next) {
    // if (this.isNew) {
    //     // TODO 18: REPLACE this._id with this.shipmentNumber
    //     const filePath = `${__dirname}/../public/data/shipment/${this._id}`;
    //     fs.mkdir(filePath, {recursive: true}, err => {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    // }
    if (this.buyerId && !this.buyerName) {
        const buyer = await Buyer.findById(this.buyerId).select({name: 1});
        this.buyerName = buyer.name;
    }
    
    next();
})

shipmentSchema.pre('save', async function (next) {
    const Entry = getModel(this.model);
    const imagekit = require('../utils/imagekit');
    if (this.isNew) {
        imagekit.createFolder(
            {
                folderName: `${this.shipmentNumber}`,
                parentFolderPath: `/shipments`
            }, err => {
                if (err) {
                    console.log(err);
                }
            }
        )
        this.shipmentMinerals = this.model.charAt(0).toUpperCase() + this.model.slice(1);
        if (["cassiterite", "coltan", "wolframite"].includes(this.model)) {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                if (!entry) return next(new AppError("Something went wrong, entry is missing", 400));
                const lot = entry.output.find(value => parseInt(value.lotNumber) === (parseInt(item.lotNumber)));
                if (!lot) return next(new AppError("Something went wrong, lot is missing", 400));
                lot.shipments.push({shipmentNumber: this.shipmentNumber, weight: item.quantity, date: new Date()});
                lot.exportedAmount += item.quantity;
                lot.cumulativeAmount -= item.quantity;
                await entry.save({validateModifiedOnly: true});
            }
        } else if (["lithium", "beryllium"].includes(this.model)) {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                if (!entry) return next(new AppError("Something went wrong, entry is missing", 400));
                entry.shipments.push({shipmentNumber: this.shipmentNumber, weight: item.quantity, date: new Date()});
                entry.exportedAmount += item.quantity;
                entry.cumulativeAmount -= item.quantity;
                await entry.save({validateModifiedOnly: true});
            }
        }
    }
    next();
})


module.exports = mongoose.model('Shipment', shipmentSchema);