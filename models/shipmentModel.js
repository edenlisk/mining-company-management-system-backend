const fs = require('fs');
const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
    {
        entries: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Entry'
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

module.exports = mongoose.model('Shipment', shipmentSchema);