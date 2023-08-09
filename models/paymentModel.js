const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const AdvancePayment = require('../models/advancePaymentModel');
const AppError = require('../utils/appError');
const { getModel } = require('../utils/helperFunctions');


const paymentSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            rel: 'Supplier'
        },
        entryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entry'
        },
        lotNumber: Number,
        supplierName: {
            type: String,
        },
        beneficiary: {
            type: String
        },
        nationalId: {
            type: String,
            required: [true, "Please provide representative's national Id"]
        },
        licenseNumber: {
            type: String
        },
        phoneNumber: {
            type: String,
            required: [true, "Please provide representative phone number"]
        },
        TINNumber: {
            type: String
        },
        email: {
            type: String,
            validate: [isEmail, 'Please provide valid email address']
        },
        location: {
            province: String,
            district: String,
            sector: String
        },
        paymentAmount: {
            type: Number,
        },
        currency: {
            type: String,
            enum: ['RWF', 'USD'],
            default: () => 'RWF'
        },
        paymentDate: {
            type: Date
        },
        paymentInAdvanceId: {
            type: mongoose.Schema.Types.ObjectId,
            rel: 'Payment'
        },
        model: String
    },
    {timestamps: true}
)

paymentSchema.pre('save', async function (next) {
    const { getModel } = require('../utils/helperFunctions');
    const Entry = getModel(this.model);
    if (this.model === "cassiterite" || this.model === "coltan" || this.model === "wolframite") {
        const entry = await Entry.findOne({_id: this.entryId});
        const lot = entry.output.find(lot => lot.lotNumber === this.lotNumber);
        if (lot.settled || lot.unpaid <= 0) return next(new AppError("This lot is already paid", 400));
        if (this.paymentInAdvanceId) {
            const payment = await AdvancePayment.findById(this.paymentInAdvanceId);
            if (!payment.consumed) {
                if (payment.remainingAmount >= lot.mineralPrice) {
                    lot.paid += (lot.mineralPrice - lot.rmaFeeUSD);
                    lot.unpaid = 0;
                    lot.settled = true;
                    lot.rmaFeeDecision = "RMA Fee pending";
                    // TODO 12: FIND APPROPRIATE COMMENT.
                    // payment.consumptionDetails.push(
                    //     {
                    //         date: (new Date()).toDateString(),
                    //         comment: `Deducted ${lot.mineralPrice - lot.rmaFeeUSD} for paying`
                    //     }
                    // )
                    // TODO 14: A. NORMALIZE ADVANCE PAYMENT TO MATCH. -> DONE
                    lot.paymentHistory.push(
                        {
                            ...payment,
                            lotNumber: undefined,
                            contractName: undefined,
                            supplierId: this.supplierId,
                            licenseNumber: this.licenseNumber,
                            TINNumber: this.TINNumber,
                            paymentDate: this.paymentDate,
                            supplierName: this.supplierName,
                            advance: true,
                            remainingAmount: undefined
                        }
                    );
                    payment.remainingAmount -= lot.mineralPrice;
                } else {
                    if (paymentSchema.remainingAmount >= lot.rmaFeeUSD) {
                        lot.rmaFeeDecision = "RMA Fee pending";
                        lot.paid += (payment.remainingAmount - lot.rmaFeeUSD);
                        lot.unpaid -= (payment.remainingAmount - lot.rmaFeeUSD);
                        // TODO 14: B. NORMALIZE ADVANCE PAYMENT TO MATCH. -> DONE
                        lot.paymentHistory.push(
                            {
                                ...payment,
                                lotNumber: undefined,
                                contractName: undefined,
                                supplierId: this.supplierId,
                                licenseNumber: this.licenseNumber,
                                TINNumber: this.TINNumber,
                                paymentDate: this.paymentDate,
                                supplierName: this.supplierName,
                                advance: true,
                                remainingAmount: undefined
                            }
                        );
                        payment.remainingAmount -= (payment.remainingAmount - lot.rmaFeeUSD);
                    }
                }
            }
        } else {
            lot.paid += this.paymentAmount;
            lot.unpaid -= this.paymentAmount;
            const self = this;
            lot.paymentHistory.push({...self, model: undefined});
        }
    } else if (this.model === "lithium" || this.model === "beryllium") {
        const entry = await Entry.findOne({_id: this.entryId});
        if (entry.settled || entry.unpaid <= 0) return next(new AppError("This lot is already paid", 400));
        if (this.paymentInAdvanceId) {
            const payment = await AdvancePayment.findById(this.paymentInAdvanceId);
            if (payment.consumed) return next(new AppError("This payment is already consumed", 400));
            if (payment.remainingAmount >= entry.mineralPrice) {
                entry.paid += entry.mineralPrice;
                entry.unpaid -= entry.mineralPrice;
                entry.settled = true;
                entry.paymentHistory.push(
                    {
                        ...payment,
                        lotNumber: undefined,
                        contractName: undefined,
                        supplierId: this.supplierId,
                        licenseNumber: this.licenseNumber,
                        TINNumber: this.TINNumber,
                        paymentDate: this.paymentDate,
                        supplierName: this.supplierName,
                        advance: true,
                        remainingAmount: undefined
                    }
                )
                payment.remainingAmount -= entry.mineralPrice;
            }
        } else {
            entry.paid += this.paymentAmount;
            entry.unpaid -= this.paymentAmount;
            const self = this;
            entry.paymentHistory.push({...self, model: undefined});
        }
    }
    this.model = undefined;
    next();
})

// paymentSchema.pre('save', async function (next) {
//     if (this.isModified('remainingAmount')) {
//         if (this.remainingAmount <= 0) {
//             this.consumed = true;
//         }
//     }
//     next();
// })

module.exports = mongoose.model('Payment', paymentSchema);
