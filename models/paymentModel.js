const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const Entry = require('./EntryModel');
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
        paymentInAdvanceId: {
            type: mongoose.Schema.Types.ObjectId,
            rel: 'Payment'
        }
    },
    {timestamps: true}
)

paymentSchema.pre('save', async function (next) {

    // 1. find the entry
    // 2. check if entry payments is unsettled
    // 3. check if there are payments in advance
            // a. if true
                    //
    if (this.entryId && this.advance === false) {
        const entry = await Entry.findById(this.entryId);
        if (entry.settled) return next(new AppError("Payment for this entry is already settled", 400));
        if (this.paymentInAdvanceId) {
            const payment = await paymentModel.findById(this.paymentInAdvanceId).select({amountReceived: 1});
            entry.paid = payment.amountReceived;
            entry.unsettled = entry.totalPrice - entry.paid;
            if (entry.unsettled <= 0) {
                entry.settled = true;
                await entry.save({validateModifiedOnly: true});
                next();
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
