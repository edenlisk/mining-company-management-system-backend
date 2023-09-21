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
            default: () => {
                return [];
            }
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
        totalShipmentQuantity: {
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
            // unique: true,
            // required: [true, "Please provide shipment number"]
            default: null
        },
        analysisCertificate: {
            type: String,
        },
        containerForwardNote: {
            type: String,
        },
        certificateOfOrigin: {
            type: String,
        },
        rmbIcglrCertificate: {
            type: String,
        },
        model: String
    },
    {timestamps: true}
)

// average price =

// TODO 8: PRE `SAVE` FOR SHIPMENT

shipmentSchema.pre('save', async function (next) {
    if (this.isNew) {
        // TODO 18: REPLACE this._id with this.shipmentNumber
        const filePath = `${__dirname}/../public/data/shipment/${this._id}`;
        fs.mkdir(filePath, {recursive: true}, err => {
            if (err) {
                console.log(err);
            }
        });
    }
    if (this.buyerId) {
        const buyer = await Buyer.findById(this.buyerId).select({name: 1});
        this.buyerName = buyer.name;
    }
    next();
})

shipmentSchema.pre('save', async function (next) {
    const Entry = getModel(this.model);
    if (this.isNew) {
        this.shipmentMinerals = this.model.charAt(0).toUpperCase() + this.model.slice(1);
        if (this.model === "cassiterite" || this.model === "coltan" || this.model === "wolframite") {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                const lot = entry.output.find(value => value.lotNumber === item.lotNumber);
                if (!lot || !entry) return next(new AppError("Something went wrong, lot is missing", 400));
                lot.shipments.push({shipmentNumber: this.shipmentNumber, weight: item.quantity});
                await entry.save({validateModifiedOnly: true});
            }
        } else if (this.model === "lithium" || this.model === "beryllium") {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                entry.shipments.push({shipmentNumber: this.shipmentNumber, weight: item.quantity});
                await entry.save({validateModifiedOnly: true});
            }
        }
    } else if (this.isModified("entries") && !this.isNew) {
        if (this.model === "cassiterite" || this.model === "coltan" || this.model === "wolframite") {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                const lot = entry.output.find(value => value.lotNumber === item.lotNumber);
                if (!lot || !entry) return next(new AppError("Something went wrong, lot is missing", 400));
                const shipment = lot.shipments.find(value => value.shipmentNumber === this.shipmentNumber);
                if (shipment) {
                    shipment.weight = item.quantity;
                } else {
                    lot.shipments.push({shipmentNumber: this.shipmentNumber, weight: item.quantity});
                }
                await entry.save({validateModifiedOnly: true});
            }
        } else if (this.model === "lithium" || this.model === "beryllium") {
            for (const item of this.entries) {
                const entry = await Entry.findById(item.entryId);
                const shipment = entry.shipments.find(value => value.shipmentNumber === this.shipmentNumber);
                shipment.weight = item.quantity;
                await entry.save({validateModifiedOnly: true});
            }
        }
    }
    next();
})


module.exports = mongoose.model('Shipment', shipmentSchema);