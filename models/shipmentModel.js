const fs = require('fs');
const mongoose = require('mongoose');
const { getModel } = require('../utils/helperFunctions');
const AppError = require('../utils/appError');

const shipmentSchema = new mongoose.Schema(
    {
        entries: {
            type: [
                {
                    entryId: mongoose.Schema.Types.ObjectId,
                    quantity: Number,
                    model: String,
                    lotNumber: Number
                }
            ],
            default: () => {
                return [];
            }
        },
        shipmentGrade: {
            type: Number,
            required: [true, "Please provide average grade of shipment"],
            validate: {
                validator: (elem) => {
                    return elem >= 0.0;
                },
                message: "Shipment grade can't be negative number"
            }
        },
        shipmentPrice: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0.0;
                },
                message: "Shipment price can't be negative number"
            }
        },
        shipmentMinerals: {
            type: String
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buyer',
            required: [true, "Please select the buyer"],
            immutable: true
        },
        shipmentSamplingDate: {
            type: Date,
        },
        shipmentContainerLoadingDate: {
            type: String,
        },
        totalShipmentQuantity: {
            type: Number
        },
        averageGrade: {
            type: Number
        },
        averagePrice: {
            type: Number,
        },
        shipmentNumber: {
            type: String,
            unique: true,
            required: [true, "Please provide shipment number"]
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
        const filePath = `${__dirname}/../public/data/shipment/${this._id}`;
        fs.mkdir(filePath, {recursive: true}, err => {
            if (err) {
                console.log(err);
            }
        });
    }
    next();
})

shipmentSchema.pre('save', async function (next) {
    if (this.isModified('entries')) {
        if (this.model === "cassiterite" || this.model === "coltan" || this.model === "wolframite") {
            for (const item of this.entries) {
                const Entry = getModel(item.model);
                const entry = await Entry.findById(item.entryId);
                const lot = entry.output.find(value => value.lotNumber === item.lotNumber);
                if (lot.cumulativeAmount > 0) {
                    lot.exportedAmount += item.quantity;
                    lot.cumulativeAmount -= item.quantity;
                }
                await entry.save({validateModifiedOnly: true});
            }
        } else if (this.model === "lithium" || this.model === "beryllium") {
            for (const item of this.entries) {
                const Entry = getModel(item.model);
                const entry = await Entry.findById(item.entryId);
                if (entry.cumulativeAmount > 0) {
                    entry.cumulativeAmount -= item.quantity;
                    entry.exportedAmount += item.quantity;
                }
                await item.save({validateModifiedOnly: true});
            }
        }
    }
    next();
})

module.exports = mongoose.model('Shipment', shipmentSchema);