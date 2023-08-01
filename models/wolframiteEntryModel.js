const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');

const wolframiteSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "wolframite",
            immutable: true
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
        cumulativeAmount: {
            type: Number,
            // validate: {
            //     validator: function (value) {
            //         return value <= this.netQuantity;
            //     },
            //     message: "Cumulative amount can't be greater than weight-out"
            // },
        },
        grade: {
            type: Number
        },
        totalPrice: Number,
        paymentCurrency: String,
        numberOfTags: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Number of tags can't be negative number"
            }
        },
        mineTags: [
            {
                type: String,
                // unique: true
            }
        ],
        negociantTags: [
            {
                type: String,
                // unique: true
            }
        ],
        rmaFee: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Rwanda Mining Association fee can't be negative number"
            }
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
            type: Number,
        },
        settled: {
            type: Boolean,
            default: () => {
                return false;
            }
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

wolframiteSchema.virtual('finalPrice').get(function () {
    return this.totalPrice - this.rmaFee;
})

wolframiteSchema.pre('save', async function(next) {
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
    if (this.isModified(["grade", "netQuantity"]) && !this.isNew) {
        // TODO 7: CALCULATE THE TOTAL PRICE OF WOLFRAMITE
    }
    next();
})

module.exports = mongoose.model('Wolframite', wolframiteSchema);

