const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('./supplierModel');
const AppError = require('../utils/appError');

const coltanSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "coltan",
            immutable: true
        },
        weightIn: Number,
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
                    shipmentNumber: String,
                    status: {
                        type: String,
                        default: "in stock"
                    },
                    tantalum: Number,
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

// coltanSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })


coltanSchema.pre('save', async function (next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    if (this.isNew) {
        this.tantalum = null;
    }
    // if (this.isModified("netQuantity")) {
    //     this.rmaFee = 125 * this.netQuantity;
    // }
    // if (this.isModified(["tantal", "netQuantity", "grade"]) && !this.isNew) {
    //     this.totalPrice = this.tantal * this.grade * this.netQuantity;
    // }
    // if (this.isModified('paid')) {
    //     if (this.paid >= (this.totalPrice - this.rmaFee)) {
    //         this.settled = true;
    //         // this.unsettled = 0;
    //     }
    // }
    if (this.output) {
        handlePaidSpecific(this.output);
    }
    next();
    // formula = tantal * grade
})



module.exports = mongoose.model('Coltan', coltanSchema);