const fs = require('fs');
const mongoose = require('mongoose');
const { getModel } = require('../utils/helperFunctions');

const shipmentSchema = new mongoose.Schema(
    {
        entries: {
            type: [
                {
                    entryId: mongoose.Schema.Types.ObjectId,
                    quantity: Number,
                    model: String,
                    mineral: String
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
        }
    },
    {timestamps: true}
)

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
        for (const item of this.entries) {
            const Entry = getModel(item.model);
            const entry = await Entry.findById(item.entryId).select({status: 1, netQuantity: 1, exportedAmount: 1, cumulativeAmount: 1});
            if (item.model === "mixed") {
                if (entry.cumulativeAmount[item.mineral] > item.quantity) {
                    this.totalShipmentQuantity += item.quantity;
                    entry.exportedAmount[item.mineral] += item.quantity;
                    entry.cumulativeAmount[item.mineral] -= item.quantity;
                    entry.status[item.mineral] = "partially exported";
                } else {
                    this.totalShipmentQuantity += entry.cumulativeAmount[item.mineral];
                    entry.exportedAmount[item.mineral] += entry.cumulativeAmount[item.mineral];
                    entry.cumulativeAmount[item.mineral] = 0;
                    entry.status[item.mineral] = "fully exported";
                }
            } else {
                if (entry.cumulativeAmount > item.quantity) {
                    this.totalShipmentQuantity += item.quantity;
                    entry.exportedAmount += item.quantity;
                    entry.cumulativeAmount -= item.quantity;
                    entry.status = "partially exported";
                } else {
                    this.totalShipmentQuantity += entry.cumulativeAmount;
                    entry.exportedAmount += entry.cumulativeAmount;
                    entry.cumulativeAmount = 0;
                    entry.status = "fully exported"
                }
            }
            await entry.save({validateModifiedOnly: true});
        }
    }
    next();
})

module.exports = mongoose.model('Shipment', shipmentSchema);