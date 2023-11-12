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
        weightIn: {
            type: Number,
            default: null
        },
        numberOfTags: Number,
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
                    status: String,
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
                    }
                },
            ]
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

// wolframiteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

wolframiteSchema.pre('save', async function(next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    // if (this.isModified(["grade", "netQuantity"]) && !this.isNew) {
    //     // TODO 7: CALCULATE THE TOTAL PRICE OF WOLFRAMITE
    // }
    if (this.output) {
        handlePaidSpecific(this.output);
    }
    next();
})

module.exports = mongoose.model('Wolframite', wolframiteSchema);

