const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');

const lithiumSchema = new mongoose.Schema(
    {
        ...entry,
        weightIn: Number,
        weightOut: Number,
        price: {
            type: Number
        },
        mineralGrade: Number,
        exportedAmount: Number,
        cumulativeAmount: Number,
        paid: Number,
        unpaid: Number,
        status: String,
        settled: Boolean,
        pricePerUnit: Number,
        rmaFee: {
            type: Number,
            default: 0,
            immutable: true
        }
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

lithiumSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.exportedAmount = 0;
        this.cumulativeAmount = this.weightOut;
        this.paid = 0;
        this.settled = false;
    }
})


module.exports = mongoose.model('Lithium', lithiumSchema);
