const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');


const cassiteriteSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "cassiterite",
            immutable: true
        },
        londonMetalExchange: {
            type: Number,
            validate: (elem) => {
                return elem >= 0;
            },
            message: "London Metal Exchange (LME) can't be negative number"
        },
        treatmentCharges: {
            type: Number,
            validate: (elem) => {
                return elem >= 0;
            },
            message: "Treatment charges (LME) can't be negative number"
        },
        unsettled: Number,
        netQuantity: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Net quantity can't be negative number"
            }
        },
        exportedAmount: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Exported amount can't be negative number"
            },
            default: 0
        },
        cumulativeAmount: {
            type: Number,
        },
        grade: {
            type: Number
        },
        rmaFee: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Rwanda Mining Association fee can't be negative number"
            }
        },
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

cassiteriteSchema.pre('save', async function (next) {
    if (this.isModified('supplierId') && !this.isNew) {
        const supplier = await Supplier.findById(this.supplierId);
        if (!supplier) return next(new AppError("The Selected supplier no longer exists!", 400));
        this.companyName = supplier.companyName;
        this.licenseNumber = supplier.licenseNumber;
        this.representativeId = supplier.representativeId;
        this.representativePhoneNumber = supplier.representativePhoneNumber;
        this.TINNumber = supplier.TINNumber;
        this.district = supplier.address.district;
    }
    if (this.isModified('netQuantity')) {
        this.rmaFee = 50 * this.netQuantity;
    }
    if (this.isModified(["londonMetalExchange", "treatmentCharges", "grade", "netQuantity"]) && !this.isNew) {
        this.totalPrice = (((this.londonMetalExchange * this.grade/100) - this.treatmentCharges)/1000) * this.netQuantity;
    }
    next()
    // formula = ((LME * Grade/100) - TC)/1000
})

cassiteriteSchema.virtual('finalPrice').get(function () {
    return this.totalPrice - this.rmaFee;
})


module.exports = mongoose.model('Cassiterite', cassiteriteSchema);