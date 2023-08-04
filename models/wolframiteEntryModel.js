const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');
const { handleChangeSupplier } = require('../utils/helperFunctions');

const wolframiteSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "wolframite",
            immutable: true
        },
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
                    status: String,
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

// wolframiteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

wolframiteSchema.pre('save', async function(next) {
    await handleChangeSupplier(this, next);
    // if (this.isModified('supplierId') && !this.isNew) {
    //     const supplier = await Supplier.findById(this.supplierId);
    //     if (!supplier) return next(new AppError("The Selected supplier no longer exists!", 400));
    //     this.companyName = supplier.companyName;
    //     this.licenseNumber = supplier.licenseNumber;
    //     this.representativeId = supplier.representativeId;
    //     this.representativePhoneNumber = supplier.representativePhoneNumber;
    //     this.TINNumber = supplier.TINNumber;
    //     this.district = supplier.address.district;
    // }
    // if (this.isModified('netQuantity')) {
    //     this.rmaFee = 50 * this.netQuantity;
    // }
    // if (this.isModified(["grade", "netQuantity"]) && !this.isNew) {
    //     // TODO 7: CALCULATE THE TOTAL PRICE OF WOLFRAMITE
    // }
    next();
})

module.exports = mongoose.model('Wolframite', wolframiteSchema);

