const mongoose = require('mongoose');
const { entry, lotSchema } = require('../models/entryModel');
const Supplier = require('../models/supplierModel');
const AppError = require('../utils/appError');

const cassiteriteLotSchema = lotSchema.clone();
cassiteriteLotSchema.add({londonMetalExchange: Number});
cassiteriteLotSchema.add({treatmentCharges: Number});


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
            type: [cassiteriteLotSchema],
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
//     status: String,
//         londonMetalExchange: Number,
//     treatmentCharges: Number,
//     shipments: {
//     type: [
//         {
//             shipmentNumber: String,
//             weight: Number,
//             date: {
//                 type: Date,
//                 default: null
//             }
//         }
//     ]
// },
//     paymentHistory: {
//         type: [
//             {
//                 paymentId: mongoose.Schema.Types.ObjectId,
//                 beneficiary: {
//                     type: String,
//                     default: null
//                 },
//                 nationalId: {
//                     type: String,
//                     default: null
//                 },
//                 phoneNumber:  {
//                     type: String,
//                     default: null
//                 },
//                 location: {
//                     type: Object,
//                     default: null
//                 },
//                 currency:  {
//                     type: String,
//                     default: null
//                 },
//                 paymentDate: {
//                     type: Date,
//                     default: null
//                 },
//                 paymentAmount: {
//                     type: Number,
//                     default: null
//                 }
//             }
//         ],
//     default: []
//     }
// },


// cassiteriteSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })

cassiteriteSchema.pre('save', async function (next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);

    if (this.isModified('output') && !this.isNew) {
        if (this.output) handlePaidSpecific(this.output);
    }
    next()
    // formula = ((LME * Grade/100) - TC)/1000
})



module.exports = mongoose.model('Cassiterite', cassiteriteSchema);