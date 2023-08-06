const mongoose = require('mongoose');

const lithiumSchema = new mongoose.Schema(
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
        mineralPrice: {
            type: Number
        },
        name: {
            type: String,
            default: "lithium",
            immutable: true
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
    next();
})


module.exports = mongoose.model('Lithium', lithiumSchema);
