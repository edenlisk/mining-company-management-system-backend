const mongoose = require('mongoose');
const {entry} = require('../models/entryModel');


const berylliumSchema = new mongoose.Schema(
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

berylliumSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.exportedAmount = 0;
        this.cumulativeAmount = this.weightOut;
        this.paid = 0;
        this.status = "in stock";
        this.settled = false;
    }
})


module.exports = mongoose.model('Beryllium', berylliumSchema);
