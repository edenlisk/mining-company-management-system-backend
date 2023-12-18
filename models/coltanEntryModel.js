const mongoose = require('mongoose');
const { entry, lotSchema } = require('../models/entryModel');
const Supplier = require('./supplierModel');
const AppError = require('../utils/appError');

const coltanLotSchema = lotSchema.clone();
coltanLotSchema.add(
    {
        tantalum: {
            type: Number
        },
        niobium: {
            type: Number,
            default: null
        },
        iron: {
            type: Number,
            default: null
        }
    }
);


const coltanSchema = new mongoose.Schema(
    {
        ...entry,
        name: {
            type: String,
            default: "coltan",
            immutable: true
        },
        weightIn: Number,
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
            type: [coltanLotSchema],
            default: [],
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
//     weightOut: Number,
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
//     status: {
//         type: String,
//     default: "in stock"
//     },
//     tantalum: Number,
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


// coltanSchema.virtual('finalPrice').get(function () {
//     return this.totalPrice - this.rmaFee;
// })


coltanSchema.pre('save', async function (next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    if (this.isModified('output') && !this.isNew) {
        if (this.output) handlePaidSpecific(this.output);
    }
    next();
    // formula = tantal * grade
})

coltanSchema.methods.requestEditPermission = function (editExpiresIn = 30) {
    this.editRequestedAt = Date.now();
    this.editExpiresAt = this.editRequestedAt + (editExpiresIn * 60000);
}


module.exports = mongoose.model('Coltan', coltanSchema);