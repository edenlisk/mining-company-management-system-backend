const mongoose = require('mongoose');

const lithiumSchema = new mongoose.Schema(
    {
        supplierName: String,
        phoneNumber: String,
        supplyDate: {
            type: Date
        },
        time: {
            type: String
        },
        mineralType: {
            type: String,
            default: "lithium",
        },
        weightIn: Number,
        weightOut: {
            type: Number,
            validate: {
                validator: function (val) {
                    if (val && this.weightIn) {
                        return val <= this.weightIn;
                    }
                },
                message: "Weight out must be less than or equal to weight in."
            }
        },
        mineralPrice: {
            type: Number
        },
        name: {
            type: String,
            default: "lithium",
            immutable: true
        },
        mineralGrade: Number,
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
        paid: Number,
        unpaid: Number,
        status: String,
        settled: Boolean,
        pricePerUnit: Number,
        nonSellAgreement: {
            weight: {
                type: Number,
                default: 0
            },
            date:  {
                type: Date,
                default: null
            }
        },
        rmaFee: {
            type: Number,
            default: 0,
            immutable: true
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
        rmaFeeDecision: {
            type: String,
            default: "exempted"
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
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

lithiumSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.exportedAmount = 0;
        this.cumulativeAmount = this.weightOut;
        this.paid = 0;
        this.settled = false;
    }
    if (this.isModified(['paid', 'unpaid']) && !this.isNew) {
        if (this.unpaid <= 0) {
            this.settled = true;
        }
    }
    next();
})


module.exports = mongoose.model('Lithium', lithiumSchema);
