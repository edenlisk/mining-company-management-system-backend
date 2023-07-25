// gross, net, company name, license number, company representative, representative ID number,
//     representative phone number, date, type of minerals (cassiterite, coltan, wolframite, berylium,
//     lithium, mixed minerals), number of mine tags

const mongoose = require('mongoose');
const Supplier = require('./supplierModel');
const Payment = require('./paymentModel');
const AppError = require('../utils/appError');

const entrySchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            // required: true
        },
        companyName: {
            type: String,
        },
        licenseNumber: {
            type: String
        },
        TINNumber: {
            type: String
        },
        companyRepresentative: {
            type: String,
            required: [true, "Please provide company representative"]
        },
        beneficiary: {
            type: String
        },
        representativeId: {
            type: String,
            immutable: true,
        },
        representativePhoneNumber: {
            type: String
        },
        supplyDate: {
            type: Date
        },
        time: {
            type: String
        },
        mineralSupplied: {
            type: String,
            enum: ["cassiterite", "coltan", "wolframite", "beryllium", "lithium", "mixed minerals"]
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
        grossQuantity: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Gross quantity can't be negative number"
            }
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
        mineTags: [String],
        negociantTags: [String],
        mineralGrade: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Grade can't be negative number"
            }
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
        londonMetalExchange: {
            type: Number
        },
        treatmentCharges: {
            type: Number
        },
        tantal: {
            type: Number
        },
        mineralPrice: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Mineral price can't be negative number"
            }
        },
        status: {
            type: String,
            enum: ["in stock", "exported", "rejected", "non-sell agreement"],
            default: () => {
                return "in stock"
            }
        },
        cassiteriteQuantity: Number,
        coltanQuantity: Number,
        coltanGrade: Number,
        cassiteriteGrade: Number,
        paymentCurrency: String,
        totalPrice: Number,
        paid: Number,
        unsettled: Number,
        settled: {
            type: Boolean,
            default: () => {
                return false;
            }
        },
        paymentMode: {
            type: String,
            enum: ["installments", "one-time"]
        },
    }, {
        timestamps: true
    }
)

// entrySchema.pre('save', async function (next) {
//     if (this.isNew) {
//         if (this.mineralSupplied.toLowerCase() === "coltan") {
//             this.LME = undefined;
//             this.TC = undefined;
//             // this.mineralPrice = this.tantal * this.mineralGrade;
//         } else if (this.mineralSupplied.toLowerCase() === "cassiterite") {
//             this.tantal = undefined;
//             // this.mineralPrice = ((this.LME * (this.mineralGrade)/100) - this.TC)/1000;
//         }
//     }
//     next()
// })

entrySchema.pre('save', async function (next) {
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
    next();
})

entrySchema.pre('save', async function (next) {
    if (this.isModified('totalPrice') && !this.isNew) {

    }
})


module.exports = mongoose.model('Entry', entrySchema);

