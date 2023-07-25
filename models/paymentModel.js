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
        paymentMode: {
            type: String
        },
        settled: {
            type: Boolean,
            default: () => {
                return false;
            }
        }
    },
    {timestamps: true}
)

paymentSchema.pre('save', async function (next) {

})

const paymentModel =  mongoose.model('Payment', paymentSchema);
module.exports = paymentModel;
