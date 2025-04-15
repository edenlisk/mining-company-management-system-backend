const fs = require('fs');
const mongoose = require('mongoose');
const Buyer = require('./buyerModel');
const AppError = require('../utils/appError');
const {decidePricingGrade} = require("../utils/helperFunctions");
const Entry = require('../models/entryModel')

const shipmentSchema = new mongoose.Schema(
    {
        shipmentGrade: {
            type: Number,
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
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

shipmentSchema.virtual('entries', {
    ref: 'LotShipment',
    foreignField: 'shipment',
    localField: '_id',
    justOne: false
})

shipmentSchema.pre(/^find/, async function (next) {
    this.populate({path: 'entries', model: 'LotShipment'});
    next();
})

shipmentSchema.virtual('netWeight').get(function () {
    if (!this.entries?.length) return null;
    return this.entries.reduce((acc, curr) => {
        return acc + curr.quantity;
    }, 0);
})

shipmentSchema.virtual('averageNiobium').get(async function () {
    if (!this.entries.length) return null;
    if (this.entries) {
        if (!this.netWeight) return null;
        const entries = await Entry.find({_id: {$in: this.entries.map(item => item.entryId)}});
        const weightNiobium = entries.reduce((acc, curr) => {
            const lot = curr.output.find(value => parseInt(value.lotNumber) === (parseInt(this.entries.find(item => item.entryId.toString() === curr._id.toString()).lotNumber)));
            const lotShipment = lot.shipmentHistory.find(value => value.shipmentNumber === this.shipmentNumber);
            if (!lotShipment) return acc;
            return acc + (lotShipment.weight *  (lot.niobium ? lot.niobium : 0));
        }, 0);
        return (weightNiobium / parseFloat(this.netWeight)).toFixed(5);
    }
})

shipmentSchema.virtual('averageGrade').get(async function () {
    if (!this.entries?.length) return null;
    if (this.entries) {
        const entries = await Entry.find({_id: {$in: this.entries.map(item => item.entryId)}});
        if (!this.netWeight) return null;
        const totalGrade = entries.reduce((acc, curr) => {
            const lot = curr.output.find(value => parseInt(value.lotNumber) === (parseInt(this.entries.find(item => item.entryId.toString() === curr._id.toString()).lotNumber)));
            const lotShipment = lot.shipmentHistory.find(value => value.shipmentNumber === this.shipmentNumber);
            if (!lotShipment) return acc;
            return acc + (lotShipment.weight * lot[decidePricingGrade(lot.pricingGrade)] || lot.ASIR || lot.mineralGrade || 0);
        }, 0);
        return (totalGrade / this.netWeight).toFixed(5);
    }
})

shipmentSchema.virtual('averagePrice').get(async function () {
    if (!this.entries?.length) return null;
    const entries = await Entry.find({_id: {$in: this.entries.map(item => item.entryId)}});
    if (!this.netWeight) return null;
    const totalPrice = entries.reduce((acc, curr) => {
        const lot = curr.output.find(value => parseInt(value.lotNumber) === (parseInt(this.entries.find(item => item.entryId.toString() === curr._id.toString()).lotNumber)));
        const lotShipment = lot.shipmentHistory.find(value => value.shipmentNumber === this.shipmentNumber);
        if (!lotShipment) return acc;
        return acc + (lotShipment.weight * lot.mineralPrice || 0);
    }, 0);
    return (totalPrice / this.netWeight).toFixed(5);
})

shipmentSchema.pre('save', async function (next) {
    if (this.buyerId && !this.buyerName) {
        const buyer = await Buyer.findById(this.buyerId).select({name: 1});
        this.buyerName = buyer.name;
    }
    
    next();
})

shipmentSchema.pre('save', async function (next) {
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
        // if (this.entries?.length > 0) {
        //     for (const item of this.entries) {
        //         const entry = await Entry.findById(item.entryId);
        //         if (!entry) return next(new AppError("Something went wrong, entry is missing", 400));
        //         const lot = entry.output?.find(value => parseInt(value.lotNumber) === (parseInt(item.lotNumber)));
        //         if (!lot) return next(new AppError("Something went wrong, lot is missing", 400));
        //         lot.shipmentHistory.push({shipmentNumber: this.shipmentNumber, weight: item.quantity, date: new Date()});
        //         await entry.save({validateModifiedOnly: true});
        //     }
        // }
    }
    next();
})


module.exports = mongoose.model('Shipment', shipmentSchema);