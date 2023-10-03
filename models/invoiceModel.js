const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId
        },
        paymentDate: {
            type: Date,
            default: null
        },
        items: {
            type: [
                {
                    itemName: {
                        type: String,
                        default: null
                    },
                    quantity: {
                        type: Number,
                        default: null
                    },
                    pricePerUnit: {
                        type: Number,
                        default: null
                    },
                    concentration: {
                        type: Number,
                        default: null
                    },
                    amount: {
                        type: Number,
                        default: null
                    }
                }
            ],
            default: []
        },
        supplierAddress: {
            province: String,
            district: String,
            sector: String,
        },
        paymentToAddress: {
            province: String,
            district: String,
            sector: String,
        },
        paymentToEmail: {
            type: String,
            default: null
        },
        paymentNo: {
            type: String,
            default: null
        },
        supplierEmail: {
            type: String,
            default: null
        },
        extraNotes: {
            type: String,
            default: null
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

invoiceSchema.virtual('total').get(function () {
    let totalAmount = 0;
    if (this.items) {
        for (const { amount } of this.items) {
            totalAmount += amount;
        }
    }
    return totalAmount;
})


module.exports = mongoose.model('Invoice', invoiceSchema);