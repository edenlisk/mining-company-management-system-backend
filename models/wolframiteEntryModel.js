const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');

const wolframiteSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "wolframite",
            immutable: true
        },
        numberOfTags: Number,
        mineTags: {
            type: [
                {
                    weightInPerMineTag: Number,
                    tagNumber: String,
                    status: String
                }
            ]
        },
        negociantTags: {
            type: [
                {
                    weightOutPerNegociantTag: Number,
                    tagNumber: String,
                    status: String
                }
            ]
        },
        output: {
            type: [
                {
                    lotNumber: Number,
                    weightOut: Number,
                    mineralGrade: Number,
                    mineralPrice: Number,
                    exportedAmount: Number,
                    cumulativeAmount: Number,
                    rmaFee: Number,
                    USDRate: Number,
                    rmaFeeUSD: Number,
                    rmaFeeDecision: {
                        type: String,
                        default: "pending"
                    },
                    paid: Number,
                    unpaid: Number,
                    settled: Boolean,
                    pricePerUnit: Number,
                    status: String,
                    paymentHistory: {
                        type: [Object],
                        default: []
                    }
                },
            ]
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

// wolframiteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

wolframiteSchema.pre('save', async function(next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    // if (this.isModified(["grade", "netQuantity"]) && !this.isNew) {
    //     // TODO 7: CALCULATE THE TOTAL PRICE OF WOLFRAMITE
    // }
    if (this.output) {
        handlePaidSpecific(this.output);
    }
    next();
})

module.exports = mongoose.model('Wolframite', wolframiteSchema);

