const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('./supplierModel');
const AppError = require('../utils/appError');
const { handleChangeSupplier } = require('../utils/helperFunctions');

const coltanSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "coltan",
            immutable: true
        },
        // tantalum: {
        //     type: Number,
        //     validate: (elem) => {
        //         return elem >= 0;
        //     },
        //     message: "Tantal value can't be negative number"
        // },
        weightIn: Number,
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
                    tantalum: Number
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

// coltanSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })


coltanSchema.pre('save', async function (next) {
    await handleChangeSupplier(this, next);
    if (this.isNew) {
        this.tantalum = null;
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
    // if (this.isModified("netQuantity")) {
    //     this.rmaFee = 125 * this.netQuantity;
    // }
    // if (this.isModified(["tantal", "netQuantity", "grade"]) && !this.isNew) {
    //     this.totalPrice = this.tantal * this.grade * this.netQuantity;
    // }
    // if (this.isModified('paid')) {
    //     if (this.paid >= (this.totalPrice - this.rmaFee)) {
    //         this.settled = true;
    //         // this.unsettled = 0;
    //     }
    // }
    next();
    // formula = tantal * grade
})



module.exports = mongoose.model('Coltan', coltanSchema);