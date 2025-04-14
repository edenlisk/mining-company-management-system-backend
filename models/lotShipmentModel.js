const mongoose = require('mongoose');


const lotShipmentSchema = new mongoose.Schema(
    {
        shipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment",
            immutable: true,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        lotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lot',
            immutable: true,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now()
        }
    }
)

lotShipmentSchema.pre(/^find/, async function(next) {
    this.populate({path: 'shipment', model: "Shipment"});
    next();
})

module.exports = mongoose.model("LotShipment", lotShipmentSchema)