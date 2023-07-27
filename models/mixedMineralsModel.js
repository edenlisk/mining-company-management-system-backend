const mongoose = require('mongoose');
const {entry} = require('../models/entryModel');
const AppError = require('../utils/appError');
const Supplier = require('../models/supplierModel');


const mixedSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "mixed",
            immutable: true
        },
        quantity: {
            cassiterite: Number,
            coltan: Number
        },
        grade: {
            coltan: Number,
            cassiterite: Number
        },
        unsettled: {
            coltan: {
                type: Number,
                default: 0
            },
            cassiterite: {
                type: Number,
                default: 0
            }
        },
        totalPrice: {
            coltan: Number,
            cassiterite: Number
        },
        settled: {
            coltan: Boolean,
            cassiterite: Boolean
        },
        paid: {
            coltan: {
                type: Number,
                default: 0
            },
            cassiterite: {
                type: Number,
                default: 0
            }
        },
        tantal: Number,
        londonMetalExchange: Number,
        treatmentCharges: Number,
        exportedAmount: {
            cassiterite: Number,
            coltan: Number
        },
        cumulativeAmount: {
            cassiterite: Number,
            coltan: Number
        },
        rmaFee: {
            cassiterite: Number,
            coltan: Number
        },
        numberOfTags: {
            coltan: {
                type: Number,
                validate: {
                    validator: (elem) => {
                        return elem >= 0;
                    },
                    message: "Number of tags can't be negative number"
                }
            },
            cassiterite: {
                type: Number,
                validate: {
                    validator: (elem) => {
                        return elem >= 0;
                    },
                    message: "Number of tags can't be negative number"
                }
            },
        },
        mineTags: [
            {
                coltan: {
                    type: String,
                    unique: true
                },
                cassiterite: {
                    type: String,
                    unique: true
                }
            }
        ],
        negociantTags: [
            {
                coltan: {
                    type: String,
                    unique: true
                },
                cassiterite: {
                    type: String,
                    unique: true
                }
            }
        ],
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)


mixedSchema.pre('save', async function (next) {
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
    if (this.isModified(["quantity", "grade", "londonMetalExchange", "tantal", "treatmentCharges"])) {
        this.rmaFee.coltan = 125 * this.quantity.coltan;
        this.rmaFee.cassiterite = 125 * this.quantity.cassiterite;
    }
    if (this.isModified(["grade", "quantity"]) && !this.isNew) {
        this.totalPrice.coltan = this.tantal * this.grade.coltan * this.quantity.coltan;
        this.totalPrice.cassiterite = (((this.londonMetalExchange * this.grade.cassiterite / 100) - this.treatmentCharges) / 1000) * this.quantity.cassiterite;
    }
    next();
})

mixedSchema.virtual("finalPrice").get(function () {
    return {
        coltan: this.totalPrice.coltan - this.rmaFee.coltan,
        cassiterite: this.totalPrice.cassiterite - this.rmaFee.cassiterite
    }
})

module.exports = mongoose.model('Mixed', mixedSchema);