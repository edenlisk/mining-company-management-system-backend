const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const AppError = require('../utils/appError');


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
        advance: {
            type: Boolean,
            default: () => false
        },
        amountReceived: {
            type: Number
        },
        currency: {
            type: String,
            enum: ['RWF', 'USD'],
            default: () => 'RWF'
        },
        consumed: {
            type: Boolean
        },
        paymentInAdvanceId: {
            type: mongoose.Schema.Types.ObjectId,
            rel: 'Payment'
        },
        remainingAmount: {
            type: Number,
            default: function () {
                return this.amountReceived;
            }
        },
        coltanAmount: {
            type: Number,
            default: 0
        },
        cassiteriteAmount: {
            type: Number,
            default: 0
        }
    },
    {timestamps: true}
)

paymentSchema.pre('save', async function (next) {
    const { getModel } = require('../utils/helperFunctions');
    const Entry = getModel(this.model);
    if (this.isNew && this.advance) {
        this.consumed = false;
    }
    if (this.entryId && this.advance === false) {
        const entry = await Entry.findById(this.entryId);
        if (entry.settled) return next(new AppError("Payment for this entry is already settled", 400));
        if (this.paymentInAdvanceId) {
            const payment = await paymentModel.findById(this.paymentInAdvanceId).select({consumed: 1, amountReceived: 1, remainingAmount: 1});
            if (!payment.consumed) {
                if (this.model === "mixed") {
                    if (payment.remainingAmount >= entry.rmaFee.coltan) {
                        payment.remainingAmount -= entry.rmaFee.coltan;
                    }
                    if (payment.remainingAmount >= entry.rmaFee.cassiterite) {
                        payment.remainingAmount -= entry.rmaFee.cassiterite;
                    }
                    if (payment.remainingAmount >= (entry.totalPrice.coltan - entry.rmaFee.coltan)) {
                        entry.paid.coltan += (entry.totalPrice.coltan - entry.rmaFee.coltan);
                        entry.unsettled.coltan -= entry.paid.coltan;
                        entry.settled.coltan = true;
                        payment.remainingAmount -= entry.paid.coltan;
                        if (payment.remainingAmount >= (entry.totalPrice.cassiterite - entry.rmaFee.cassiterite)) {
                            entry.paid.cassiterite += (entry.totalPrice.cassiterite - entry.rmaFee.cassiterite);
                            entry.unsettled.cassiterite -= entry.paid.cassiterite;
                            entry.settled.cassiterite = true;
                            payment.remainingAmount -= entry.paid.cassiterite;
                        } else {
                            entry.paid.cassiterite += payment.remainingAmount;
                            entry.unsettled.cassiterite -= entry.paid.cassiterite;
                            payment.consumed = true;
                        }
                    } else {
                        entry.paid.coltan += payment.remainingAmount;
                        entry.unsettled.coltan -= entry.paid.coltan;
                        payment.consumed = true;
                    }
                } else {
                    payment.remainingAmount -= entry.rmaFee;
                    if (payment.remainingAmount >= (entry.totalPrice - entry.rmaFee)) {
                        entry.paid += (entry.totalPrice - entry.rmaFee);
                        entry.unsettled -= entry.paid;
                        entry.settled = true;
                        payment.remainingAmount -= entry.paid;
                    } else {
                        entry.paid += payment.remainingAmount;
                        entry.unsettled -= entry.paid;
                        payment.consumed = true;
                    }
                }
                await payment.save({validateModifiedOnly: true});
            }
        } else {
            if (this.model === "mixed") {
                entry.paid.coltan += this.coltanAmount;
                entry.unsettled.coltan -= this.coltanAmount;
                entry.paid.cassiterite += this.cassiteriteAmount;
                entry.unsettled.cassiterite -= this.cassiteriteAmount;
            } else {
                entry.paid += this.amountReceived;
                entry.unsettled -= this.amountReceived;
            }
        }
        await entry.save({validateModifiedOnly: true});
    }
    next();
})

paymentSchema.pre('save', async function (next) {
    if (this.isModified('remainingAmount')) {
        if (this.remainingAmount <= 0) {
            this.consumed = true;
        }
    }
    next();
})

const paymentModel =  mongoose.model('Payment', paymentSchema);
module.exports = paymentModel;
