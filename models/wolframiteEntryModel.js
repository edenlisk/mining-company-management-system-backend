const mongoose = require('mongoose');
const { entry, lotSchema } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');

const wolframiteLotSchema = lotSchema.clone();
wolframiteLotSchema.add({metricTonUnit: Number});

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
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag"
                }
            ],
            default: []
        },
        negociantTags: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Tag"
                }
            ],
            default: []
        },
        output: {
            type: [wolframiteLotSchema],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)


// {
//     lotNumber: Number,
//         weightOut: Number,
//     mineralGrade: Number,
//     mineralPrice: Number,
//     metricTonUnit: Number,
//     exportedAmount: Number,
//     cumulativeAmount: Number,
//     rmaFee: Number,
//     USDRate: Number,
//     rmaFeeUSD: Number,
//     rmaFeeDecision: {
//     type: String,
// default: "pending"
// },
//     paid: Number,
//         unpaid: Number,
//     settled: Boolean,
//     pricePerUnit: Number,
//     nonSellAgreement: {
//     weight: {
//         type: Number,
//     default: 0
//     },
//     date:  {
//         type: Date,
//     default: null
//     }
// },
//     gradeImg: {
//         filename: String,
//             createdAt: Date,
//             filePath: String,
//             fileId: String
//     },
//     shipments: {
//         type: [
//             {
//                 shipmentNumber: String,
//                 weight: Number,
//                 date: {
//                     type: Date,
//                     default: null
//                 }
//             }
//         ]
//     },
//     status: String,
//         paymentHistory: {
//     type: [
//         {
//             paymentId: mongoose.Schema.Types.ObjectId,
//             beneficiary: {
//                 type: String,
//                 default: null
//             },
//             nationalId: {
//                 type: String,
//                 default: null
//             },
//             phoneNumber:  {
//                 type: String,
//                 default: null
//             },
//             location: {
//                 type: Object,
//                 default: null
//             },
//             currency:  {
//                 type: String,
//                 default: null
//             },
//             paymentDate: {
//                 type: Date,
//                 default: null
//             },
//             paymentAmount: {
//                 type: Number,
//                 default: null
//             }
//         }
//     ],
// default: []
// }
// },


// wolframiteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

wolframiteSchema.pre('save', async function(next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    if (this.isModified('output') && !this.isNew) {
        if (this.output) handlePaidSpecific(this.output);
    }
    next();
})

module.exports = mongoose.model('Wolframite', wolframiteSchema);

