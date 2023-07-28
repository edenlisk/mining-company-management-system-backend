const mongoose = require('mongoose');
const { entry } = require('../models/entryModel');
const Supplier = require('./supplierModel');
const AppError = require('../utils/appError');

const coltanSchema = new mongoose.Schema(
    {
        ...entry,
        unsettled: Number,
        name: {
            type: String,
            default: "coltan",
            immutable: true
        },
        tantal: {
            type: Number,
            validate: (elem) => {
                return elem >= 0;
            },
            message: "Tantal value can't be negative number"
        },
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
                unique: true
            }
        ],
        negociantTags: [
            {
                type: String,
                unique: true
            }
        ],
        totalPrice: Number,
        paymentCurrency: String,
        paid: {
            type: Number,
            default: 0,
            validate: {
                validator: function (value) {
                    return value <= (this.totalPrice - this.rmaFee);
                },
                // TODO 4: FIND APPROPRIATE ERROR MESSAGE
                message: ""
            }
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
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

coltanSchema.virtual('finalPrice').get(function () {
    return this.totalPrice - this.rmaFee;
})


coltanSchema.pre('save', async function (next) {
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
    if (this.isModified("netQuantity")) {
        this.rmaFee = 125 * this.netQuantity;
    }
    if (this.isModified(["tantal", "netQuantity", "grade"]) && !this.isNew) {
        this.totalPrice = this.tantal * this.grade * this.netQuantity;
    }
    if (this.isModified('paid')) {
        if (this.paid >= (this.totalPrice - this.rmaFee)) {
            this.settled = true;
            // this.unsettled = 0;
        }
    }
    next();
    // formula = tantal * grade
})



module.exports = mongoose.model('Coltan', coltanSchema);