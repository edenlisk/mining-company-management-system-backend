const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');


const generalEntrySchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "general",
            immutable: true,
        },
        exportedAmount: {
            type: Number,
            // validate: {
            //     validator: function (value) {
            //         return value <= this.netQuantity;
            //     },
            //     message: "Exported amount can't be greater than weight-out"
            // },
            default: 0
        },
        netQuantity: {
            type: Number,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Weight-out can't be negative number"
            }
        },
        cumulativeAmount: {
            type: Number,
            // validate: {
            //     validator: function (value) {
            //         return value <= this.netQuantity;
            //     },
            //     message: "Cumulative amount can't be greater than weight-out"
            // },
        },
        paid: {
            type: Number,
            // validate: function (value) {
            //     return value <= (this.totalPrice - this.rmaFee);
            // },
            // // TODO 6: FIND APPROPRIATE ERROR MESSAGE
            // message: ""
        },
        unsettled: {
            type: Number
        },
        grade: {
            type: Number
        },
        settled: {
            type: Boolean,
            default: () => {
                return false;
            }
        },
        rmaFee: {
            type: Number,
            default: 0,
            immutable: true
        },
        totalPrice: {
            type: Number
        },
        paymentCurrency: {
            type: Number
        },
        status: {
            type: String,
            enum: ["in stock", "fully exported", "rejected", "non-sell agreement", "partially exported"],
            default: () => {
                return "in stock"
            }
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

generalEntrySchema.virtual('finalPrice').get(function () {
    return this.totalPrice - this.rmaFee;
})

generalEntrySchema.pre('save', async function (next) {
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
    if (this.isModified(['grade', 'netQuantity']) && !this.isNew) {
        // calculate the ///////
    }
    next();
})


module.exports = mongoose.model('GeneralEntry', generalEntrySchema);