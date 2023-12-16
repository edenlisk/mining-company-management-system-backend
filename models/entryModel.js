// gross, net, company name, license number, company representative, representative ID number,
//     representative phone number, date, type of minerals (cassiterite, coltan, wolframite, berylium,
//     lithium, mixed minerals), number of mine tags

const mongoose = require('mongoose');

exports.entry = {
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        // required: true
    },
    mineralType: {
        type: String
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
        // required: [true, "Please provide company representative"]
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
    comment: {
        type: String,
        default: null
    }
    // visible: {
    //     type: Boolean,
    //     default: true
    // },
    // editRequestedAt: Date,
    // editExpiresAt: Date,
    // editableFields: {
    //     type: [String],
    //     default: []
    // }
}

const lotSchema = new mongoose.Schema(
    {
        lotNumber: {
            type: String,
            required: [true, "Please provide lot number"],
        },
        weightOut: {
            type: Number,
            required: [true, "Please provide weight out"],
        },
        mineralGrade: Number,
        mineralPrice: Number,
        pricingGrade: {
            type: String,
            default: null
        },
        ASIR: {
            type: Number,
            default: null
        },
        netPrice: {
            type: Number,
            default: null
        },
        sampleIdentification: {
            type: String,
            default: null
        },
        exportedAmount: {
            type: Number,
            validate: {
                validator: function (val) {
                    if (val && this.weightOut) {
                        return val <= this.weightOut;
                    }
                },
                message: "Exported amount must be less than or equal to weight out."
            }
        },
        cumulativeAmount: {
            type: Number,
            validate: {
                validator: function (val) {
                    if (val && this.weightOut) {
                        return val <= this.weightOut;
                    }
                },
                message: "Balance amount must be less than or equal to weight out."
            }
        },
        rmaFee: Number,
        USDRate: Number,
        rmaFeeUSD: Number,
        rmaFeeDecision: {
            type: String,
            default: "pending"
        },
        paid: Number,
        unpaid: {
            type: Number,
        },
        settled: Boolean,
        pricePerUnit: Number,
        nonSellAgreement: {
            weight: {
                type: Number,
                validate: {
                    validator: function (val) {
                        if (val && this.weightOut) {
                            return val <= this.weightOut;
                        }
                    },
                    message: "Non sell agreement must be less than or equal to weight out."
                },
                default: 0
            },
            date:  {
                type: Date,
                default: null
            }
        },
        gradeImg: {
            filename: String,
            createdAt: Date,
            filePath: String,
            fileId: String
        },
        shipments: {
            type: [
                {
                    shipmentNumber: String,
                    weight: Number,
                    date: {
                        type: Date,
                        default: null
                    }
                }
            ]
        },
        status: {
            type: String,
            default: "in stock"
        },
        paymentHistory: {
            type: [
                {
                    paymentId: mongoose.Schema.Types.ObjectId,
                    beneficiary: {
                        type: String,
                        default: null
                    },
                    nationalId: {
                        type: String,
                        default: null
                    },
                    phoneNumber:  {
                        type: String,
                        default: null
                    },
                    location: {
                        type: Object,
                        default: null
                    },
                    currency:  {
                        type: String,
                        default: null
                    },
                    paymentDate: {
                        type: Date,
                        default: null
                    },
                    paymentAmount: {
                        type: Number,
                        default: null
                    }
                }
            ],
            default: []
        },
        comment: {
            type: String,
            default: null
        }
    }
)

exports.lotSchema = lotSchema;

// const entrySchema = new mongoose.Schema(
//     {
//         mineralSupplied: {
//             type: String,
//             enum: ["cassiterite", "coltan", "wolframite", "beryllium", "lithium", "mixed minerals"]
//         },
//         mineralPrice: {
//             type: Number,
//             validate: {
//                 validator: (elem) => {
//                     return elem >= 0;
//                 },
//                 message: "Mineral price can't be negative number"
//             }
//         },
//     }, {
//         timestamps: true
//     }
// )

// TODO 1: FIND CONVENIENT WAY OF STRUCTURING TYPE OF MINERALS AND ITS QUANTITY

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

// entrySchema.pre('save', async function (next) {
//     if (this.isModified('supplierId') && !this.isNew) {
//         const supplier = await Supplier.findById(this.supplierId);
//         if (!supplier) return next(new AppError("The Selected supplier no longer exists!", 400));
//         this.companyName = supplier.companyName;
//         this.licenseNumber = supplier.licenseNumber;
//         this.representativeId = supplier.representativeId;
//         this.representativePhoneNumber = supplier.representativePhoneNumber;
//         this.TINNumber = supplier.TINNumber;
//         this.district = supplier.address.district;
//     }
//     next();
// })


// module.exports = mongoose.model('Entry', entrySchema);

