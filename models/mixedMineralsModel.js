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
                validate: {
                    validator: function (value) {
                        return value <= (this.totalPrice.coltan - this.rmaFee.coltan);
                    },
                    message: "Coltan paid amount can't be greater than ..........................."
                },
                default: 0
            },
            cassiterite: {
                type: Number,
                default: 0,
                validate: {
                    validator: function (value) {
                        return value <= (this.totalPrice.cassiterite - this.rmaFee.cassiterite);
                    },
                    // TODO 3: FIND APPROPRIATE ERROR MESSAGE
                    message: "Cassiterite paid amount can't be greater than ..........................."
                },
            }
        },
        tantal: Number,
        londonMetalExchange: Number,
        treatmentCharges: Number,
        exportedAmount: {
            cassiterite: {
                type: Number,
                default: () => {
                    return 0;
                }
            },
            coltan: {
                type: Number,
                default: () => {
                    return 0;
                }
            }
        },
        cumulativeAmount: {
            cassiterite: {
                type: Number,
                validate: {
                    validator: function (value) {
                        return value <= this.quantity.cassiterite;
                    },
                    message: "Cassiterite cumulative amount can't be greater than it's weight-out"
                },
                default: function () {
                    return this.quantity.cassiterite;
                }
            },
            coltan: {
                type: Number,
                validate: {
                    validator: function (value) {
                        return value <= this.quantity.coltan;
                    },
                    message: "Coltan cumulative amount can't be greater than it's weight-out"
                },
                default: function () {
                    return this.quantity.coltan;
                }
            }
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
        status: {
            coltan: {
                type: String,
                enum: ["in stock", "fully exported", "rejected", "non-sell agreement", "partially exported"],
                default: () => {
                    return "in stock"
                }
            },
            cassiterite: {
                type: String,
                enum: ["in stock", "fully exported", "rejected", "non-sell agreement", "partially exported"],
                default: () => {
                    return "in stock"
                }
            }
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)


mixedSchema.virtual("finalPrice").get(function () {
    return {
        coltan: this.totalPrice.coltan - this.rmaFee.coltan,
        cassiterite: this.totalPrice.cassiterite - this.rmaFee.cassiterite
    }
})

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
    if (this.isModified('paid')) {
        if (this.paid.coltan >= (this.totalPrice.coltan - this.rmaFee.coltan)) {
            this.settled.coltan = true;
            // this.unsettled.coltan = 0;
        }
        if (this.paid.cassiterite >= (this.totalPrice.cassiterite - this.rmaFee.cassiterite)) {
            this.settled.cassiterite = true;
            // this.unsettled.cassiterite = 0;
        }
    }
    next();
})

module.exports = mongoose.model('Mixed', mixedSchema);