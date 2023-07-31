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
        unsettled: {
            type: Number,
            validate: (value) => {
                return value >= 0;
            },
            message: "Unsettled amount can't be negative number"
        },
        netQuantity: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Weight-out can't be negative number"
            }
        },
        exportedAmount: {
            type: Number,
            validate: {
                validator: function (value) {
                    return value <= this.netQuantity;
                },
                message: "Exported amount can't be greater than weight-out"
            },
            default: 0
        },
        cumulativeAmount: {
            type: Number,
            validate: {
                validator: function (value) {
                    return value <= this.netQuantity;
                },
                message: "Cumulative amount can't be greater than weight-out"
            }
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
                weightInPermineTag: Number,
                tagNumber: {
                    type: String,
                    unique: true
                }
            }
        ],
        negociantTags: [
            {
                weightOutPerNegociantTag: Number,
                tagNumber: {
                    type: String,
                    unique: true
                }
            }
        ],
        totalPrice: Number,
        paymentCurrency: String,
        paid: {
            type: Number,
            validate: function (value) {
                return value <= (this.totalPrice - this.rmaFee);
            },
            // TODO 4: FIND APPROPRIATE ERROR MESSAGE
            message: ""
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

cassiteriteSchema.virtual('finalPrice').get(function () {
    return this.totalPrice - this.rmaFee;
})

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
    if (this.isModified('paid')) {
        if (this.paid >= (this.totalPrice - this.rmaFee)) {
            this.settled = true;
            // this.unsettled = 0;
        }
    }
    next()
    // formula = ((LME * Grade/100) - TC)/1000
})



module.exports = mongoose.model('Cassiterite', cassiteriteSchema);