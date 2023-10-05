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
        weightIn: Number,
        weightOut: Number,
        mineralPrice: {
            type: Number
        },
        name: {
            type: String,
            default: "lithium",
            immutable: true
        },
        mineralGrade: Number,
        exportedAmount: Number,
        cumulativeAmount: Number,
        paid: Number,
        unpaid: Number,
        status: String,
        settled: Boolean,
        pricePerUnit: Number,
        rmaFee: {
            type: Number,
            default: 0,
            immutable: true
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
        rmaFeeDecision: {
            type: String,
            default: "RMA Fee exempted"
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
        visible: {
            type: Boolean,
            default: true
        }
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
