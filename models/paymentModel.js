const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
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
        lotId: {
            type: mongoose.Schema.Types.ObjectId
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
    },
    {timestamps: true}
)

paymentSchema.pre('save', async function (next) {
    const { getModel } = require('../utils/helperFunctions');
    const Entry = getModel(this.name);
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
