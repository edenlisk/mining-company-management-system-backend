const fs = require('fs');
const mongoose = require('mongoose');
const Entry = require('./entryModel');

const shipmentSchema = new mongoose.Schema(
    {
        entries: {
            type: [
                {
                    entryId: {
                        type: mongoose.Schema.Types.ObjectId,
                        rel: 'Entry'
                    },
                    quantity: Number
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
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buyer',
            required: [true, "Please select the buyer"]
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

shipmentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const filePath = `${__dirname}/../public/data/shipment/${this.buyerId}`;
        fs.mkdir(`${filePath}/${this._id}`, {recursive: true}, err => {
            if (err) {
                console.log(err);
            }
        });
    }
    next();
})

shipmentSchema.pre('save', async function (next) {
    // if (this.isModified('entries')) {
    //     for (const item of this.entries) {
    //         const entry = await Entry.findById(item.entryId).select({status: 1, netQuantity: 1, exportedAmount: 1, cumulativeAmount: 1});
    //         if (entry.netQuantity > item.quantity) {
    //             entry.status = "partially exported";
    //             entry.exportedAmount += item.quantity;
    //         } else if (item.quantity === entry.netQuantity) {
    //             entry.status = "exported";
    //             entry.exportedAmount = entry.netQuantity;
    //         }
    //         this.totalShipmentQuantity += entry.quantity;
    //
    //     }
    // }
})

module.exports = mongoose.model('Shipment', shipmentSchema);