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
        lotId: Number,
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
            type: String
        },
        paymentAmount: {
            type: Number,
        },
        currency: {
            type: String,
            enum: ['RWF', 'USD'],
            default: () => 'RWF'
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
        const lot = entry.output.find(lot => lot.lotNumber === this.lotId);
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
                    // TODO 14: A. NORMALIZE ADVANCE PAYMENT TO MATCH.
                    const self = this;
                    lot.payments.push({...self, paymentAmount: lot.mineralPrice})
                    payment.remainingAmount -= lot.mineralPrice;
                } else {
                    if (paymentSchema.remainingAmount >= lot.rmaFeeUSD) {
                        lot.rmaFeeDecision = "RMA Fee pending";
                        lot.paid += (payment.remainingAmount - lot.rmaFeeUSD);
                        lot.unpaid -= (payment.remainingAmount - lot.rmaFeeUSD);
                        // TODO 14: B. NORMALIZE ADVANCE PAYMENT TO MATCH.
                        const self = this;
                        lot.payments.push({...self, paymentAmount: lot.mineralPrice})
                        payment.remainingAmount -= (payment.remainingAmount - lot.rmaFeeUSD);
                    }
                }
            }
        } else {

        }
    } else if (this.model === "lithium" || this.model === "beryllium") {
        console.log('general model');
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
