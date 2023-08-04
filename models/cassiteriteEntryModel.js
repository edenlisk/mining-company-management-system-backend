const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');
const { handleChangeSupplier } = require('../utils/helperFunctions');


const cassiteriteSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "cassiterite",
            immutable: true
        },
        numberOfTags: Number,
        weightIn: Number,
        mineTags: {
            type: [
                {
                    weightInPerMineTag: Number,
                    tagNumber: String,
                    status: String
                }
            ],
            default: []
        },
        negociantTags: {
            type: [
                {
                    weightOutPerNegociantTag: Number,
                    tagNumber: String,
                    status: String
                }
            ],
            default: []
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
                    londonMetalExchange: Number,
                    treatmentCharges: Number
                },
            ],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

// cassiteriteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

cassiteriteSchema.pre('save', async function (next) {
    await handleChangeSupplier(this, next);
    if (this.isNew) {
        this.londonMetalExchange = null;
        this.treatmentCharges = null;
    }
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
    // if (this.isModified(["londonMetalExchange", "treatmentCharges", "grade", "netQuantity"]) && !this.isNew) {
    //     this.totalPrice = (((this.londonMetalExchange * this.grade/100) - this.treatmentCharges)/1000) * this.netQuantity;
    // }
    // if (this.isModified('paid')) {
    //     if (this.paid >= (this.totalPrice - this.rmaFee)) {
    //         this.settled = true;
    //         // this.unsettled = 0;
    //     }
    // }
    next()
    // formula = ((LME * Grade/100) - TC)/1000
})



module.exports = mongoose.model('Cassiterite', cassiteriteSchema);