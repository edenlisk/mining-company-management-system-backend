const mongoose = require('mongoose');

const berylliumSchema = new mongoose.Schema(
    {
        supplier: String,
        phoneNumber: String,
        supplyDate: {
            type: Date
        },
        time: {
            type: String
        },
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
    next()
})


module.exports = mongoose.model('Beryllium', berylliumSchema);
