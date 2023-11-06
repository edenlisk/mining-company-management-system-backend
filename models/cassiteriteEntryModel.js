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
        numberOfTags: Number,
        weightIn: Number,
        mineTags: {
            type: [
                {
                    weightInPerMineTag: {
                        type: Number,
                        default: null
                    },
                    tagNumber: {
                        type: String,
                        default: null
                    },
                    status: {
                        type: String,
                        default: null
                    }
                }
            ],
            default: []
        },
        negociantTags: {
            type: [
                {
                    weightOutPerNegociantTag: {
                        type: String,
                        default: null
                    },
                    tagNumber: {
                        type: String,
                        default: null
                    },
                    status: {
                        type: String,
                        default: null
                    }
                }
            ],
            default: []
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
                    gradeImg: {
                        filename: String,
                        createdAt: Date,
                        filePath: String,
                        fileId: String
                    },
                    status: String,
                    londonMetalExchange: Number,
                    treatmentCharges: Number,
                    shipments: {
                        type: [
                            {
                                shipmentNumber: String,
                                weight: Number,
                                date: {
                                    type: Date,
                                    default: () => {
                                        return (new Date()).toDateString();
                                    }
                                }
                            }
                        ]
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
                                    type: String,
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
                    }
                },
            ],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

// cassiteriteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

cassiteriteSchema.pre('save', async function (next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    if (this.isNew) {
        this.londonMetalExchange = null;
        this.treatmentCharges = null;
    }

    // if (this.isModified('netQuantity')) {
    //     this.rmaFee = 50 * this.netQuantity;
    // }
    // if (this.isModified(["londonMetalExchange", "treatmentCharges", "grade", "netQuantity"]) && !this.isNew) {
    //     this.totalPrice = (((this.londonMetalExchange * this.grade/100) - this.treatmentCharges)/1000) * this.netQuantity;
    // }
    // if (this.isModified('paid')) {
    //     if (this.paid >= (this.totalPrice - this.rmaFee)) {
    //         this.settled = true;
    //         // this.unsettled = 0;
    //     }
    // }
    if (this.output) {
        handlePaidSpecific(this.output);
    }
    next()
    // formula = ((LME * Grade/100) - TC)/1000
})



module.exports = mongoose.model('Cassiterite', cassiteriteSchema);