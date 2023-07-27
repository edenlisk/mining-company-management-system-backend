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
        coltanAmount: Number,
        cassiteriteAmount: Number
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
                    if (payment.remainingAmount >= (entry.totalPrice.coltan - entry.rmaFee.coltan)) {
                        entry.paid.coltan += (entry.totalPrice.coltan - entry.rmaFee.coltan);
                        entry.unsettled.coltan = 0;
                        entry.settled.coltan = true;
                        if ((payment.remainingAmount - entry.paid.coltan) > (entry.totalPrice.cassiterite - entry.rmaFee.cassiterite)) {
                            entry.paid.cassiterite += (entry.totalPrice.cassiterite - entry.rmaFee.cassiterite);
                            entry.unsettled.cassiterite = 0;
                            entry.settled.cassiterite = true;
                            payment.remainingAmount = payment.remainingAmount - entry.paid.coltan - entry.rmaFee.coltan - entry.rmaFee.cassiterite - entry.paid.cassiterite;
                        }
                    } else {
                        entry.paid.coltan += payment.remainingAmount;
                        entry.unsettled.coltan += (entry.totalPrice.coltan - entry.rmaFee.coltan);
                    }
                }
                //////////////////////
                entry.paid = payment.amountReceived;
                entry.unsettled = entry.totalPrice - entry.paid;
                payment.consumed = true;
                await payment.save({validateModifiedOnly: true});
                if (entry.unsettled <= 0) {
                    entry.settled = true;
                    await entry.save({validateModifiedOnly: true});
                    next();
                }
            }
        }
        entry.paid = entry.paid + this.amountReceived;
        entry.unsettled = entry.unsettled - this.amountReceived;
        if (entry.unsettled <= 0) {
            entry.settled = true;
        }
        await entry.save({validateModifiedOnly: true});
    }
    next();
})

const paymentModel =  mongoose.model('Payment', paymentSchema);
module.exports = paymentModel;
