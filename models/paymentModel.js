const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const paymentSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            rel: 'Supplier'
        },
        supplierName: {
            type: String,
        },
        companyRepresentative: {
            type: String
        },
        nationalId: {
            type: String,
            required: [true, "Please provide representative's national Id"]
        },
        licenceNumber: {
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
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('Payment', paymentSchema);
