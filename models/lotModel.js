const mongoose = require('mongoose');
const {decidePricingGrade} = require("../utils/helperFunctions");

const Settings = require('../models/settingsModel');


// const lotSchema = new mongoose.Schema(
//     {
//         entry: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Entry',
//             // refPath: 'docModel',
//             required: true,
//         },
//         docModel: {
//             type: String,
//             required: true,
//             immutable: true,
//             enum: ['Lithium', 'Beryllium', 'Coltan', 'Cassiterite', 'Wolframite']
//         },
//         lotNumber: {
//             type: Number,
//             required: [true, "Please provide lot number"],
//         },
//         weightOut: {
//             type: Number,
//             validate: {
//                 validator: function(val) {
//                     if (this.weightIn && val) {
//                         return this.weightIn >= val;
//                     }
//                 },
//                 message: "Weight out cannot be greater than weight in"
//             }
//             // required: [true, "Please provide weight out"],
//         },
//         weightIn: {
//             type: Number,
//             required: [true, "Please provide lot weight in"],
//         },
//         mineralGrade: {
//             type: Number,
//             default: null
//         },
//         mineralPrice: {
//             type: Number,
//             default: null
//         },
//         ASIR: {
//             type: Number,
//             default: null
//         },
//         pricingGrade: {
//             type: String,
//             default: function () {
//                 if (this.ASIR) {
//                     return "ASIR"
//                 } else {
//                     return null;
//                 }
//             }
//         },
//         sampleIdentification: {
//             type: String,
//             default: null
//         },
//         rmaFeeRWF: {
//             type: Number,
//             default: null
//         },
//         USDRate: {
//             type: Number,
//             default: null
//         },
//         rmaFeeDecision: {
//             type: String,
//             default: "pending"
//         },
//         pricePerUnit: {
//             type: Number,
//             default: null
//         },
//         nonSellAgreement: {
//             weight: {
//                 type: Number,
//                 validate: {
//                     validator: function (val) {
//                         if (val && this.weightOut) {
//                             return val <= this.weightOut;
//                         }
//                     },
//                     message: "Non sell agreement must be less than or equal to weight out."
//                 },
//                 default: 0
//             },
//             date: {
//                 type: Date,
//                 default: null
//             }
//         },
//         gradeImg: {
//             filename: {
//                 type: String,
//                 default: null
//             },
//             createdAt: {
//                 type: Date,
//                 default: null
//             },
//             filePath: {
//                 type: String,
//                 default: null
//             },
//             fileId: {
//                 type: String,
//                 default: null
//             }
//         },
//         comment: {
//             type: String,
//             default: null
//         },
//
//         // SPECIFIC FIELDS
//         tantal: {
//             type: Number
//         },
//         niobium: {
//             type: Number,
//             default: null
//         },
//         iron: {
//             type: Number,
//             default: null
//         },
//
//         // CASSITERITE
//         londonMetalExchange: {
//             type: Number,
//             default: null
//         },
//         treatmentCharges: {
//             type: Number,
//             default: null
//         },
//         // WORLFRAMITE
//         metricTonUnit: {
//             type: Number,
//             default: null
//         }
//     }, {
//         toJSON: {virtuals: true},
//         toObject: {virtuals: true}
//     }
// )
//
// lotSchema.virtual('shipmentHistory', {
//     ref: 'LotShipment',
//     localField: '_id',
//     foreignField: 'lotId',
//     justOne: false
// })
//
// lotSchema.pre('save', async function (next) {
//     const {
//         rmaFeeCassiterite,
//         rmaFeeLithium,
//         rmaFeeColtan,
//         rmaFeeWolframite,
//         rmaFeeBeryllium
//     } = await Settings.findOne();
//     if (this.isModified(["pricingGrade", "londonMetalExchange", "treatmentCharges", "mineralGrade", "ASIR"]) && !this.isNew) {
//         if (this[decidePricingGrade(this.pricingGrade)] && this.londonMetalExchange && this.treatmentCharges) {
//             this.pricePerUnit = (((this.londonMetalExchange * (this[decidePricingGrade(this.pricingGrade)] / 100)) - this.treatmentCharges) / 1000);
//         }
//     }
//     if (this.isModified(['pricingGrade', 'metricTonUnit', 'mineralGrade', 'ASIR']) && !this.isNew) {
//         if (this[decidePricingGrade(this.pricingGrade)] && this.metricTonUnit) {
//             this.pricePerUnit = ((this.metricTonUnit * this[decidePricingGrade(this.pricingGrade)] / 100) * 0.1);
//         }
//     }
//     if (this.isModified(["pricingGrade", "tantal", "mineralGrade", "ASIR"]) && !this.isNew) {
//         if (this[decidePricingGrade(this.pricingGrade)] && this.tantal) {
//             this.pricePerUnit = this.tantal * this[decidePricingGrade(this.pricingGrade)];
//         }
//     }
//     if (['coltan', 'cassiterite', 'wolframite'].includes(this.docModel?.toLowerCase())) {
//         if (this.isModified(['pricingGrade', 'pricePerUnit', 'weightOut']) && !this.isNew) {
//             if (this[decidePricingGrade(this.pricingGrade)] && this.weightOut) {
//                 this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
//             }
//         }
//     } else {
//         if (this.isModified('pricePerUnit') && !this.isNew) {
//             if (this.pricePerUnit && this.weightOut) {
//                 this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
//             }
//         }
//     }
//     let rmaFee = 0;
//     if (this.docModel.toLowerCase() === 'cassiterite') rmaFee = rmaFeeCassiterite;
//     else if (this.docModel.toLowerCase() === 'coltan') rmaFee = rmaFeeColtan;
//     else if (this.docModel.toLowerCase() === 'lithium') rmaFee = rmaFeeLithium;
//     else if (this.docModel.toLowerCase() === 'beryllium') rmaFee = rmaFeeBeryllium;
//     else if (this.docModel.toLowerCase() === 'wolframite') rmaFee = rmaFeeWolframite;
//     if (this.isModified('weightOut')) {
//         if (this.weightOut && rmaFee) {
//             this.rmaFeeRWF = this.weightOut * rmaFee;
//         }
//     }
//
//     next();
// })


const calculatePricePerUnit = (model, params) => {
    if (!model || !params) return null;

    switch (model.toLowerCase()) {
        case "cassiterite":
            const { LME, grade, TC } = params;
            if (LME && grade && TC) {
                return (((LME * grade/100) - TC)/1000);
            }
            break;
        case "coltan":
            const { tantal, grade: coltanGrade } = params;
            if (tantal && coltanGrade) {
                return (tantal * coltanGrade);
            }
            break;
        case "wolframite":
            const { MTU, grade: wolfGrade } = params;
            if (MTU && wolfGrade) {
                return ((MTU * wolfGrade/100) * 0.1);
            }
            break;
        case "lithium":
        case "beryllium":
            // For lithium and beryllium, just return the price directly
            const { pricePerUnit } = params;
            return pricePerUnit || null;
    }
    return null;
};


const lotSchema = new mongoose.Schema(
    {
        entry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entry',
            required: true,
        },
        docModel: {
            type: String,
            required: true,
            immutable: true,
            enum: ['Lithium', 'Beryllium', 'Coltan', 'Cassiterite', 'Wolframite']
        },
        lotNumber: {
            type: Number,
            required: [true, "Please provide lot number"],
        },
        weightOut: {
            type: Number,
            validate: {
                validator: function(val) {
                    if (this.weightIn && val) {
                        return this.weightIn >= val;
                    }
                },
                message: "Weight out cannot be greater than weight in"
            }
        },
        weightIn: {
            type: Number,
            required: [true, "Please provide lot weight in"],
        },
        mineralGrade: {
            type: Number,
            default: null
        },
        mineralPrice: {
            type: Number,
            default: null
        },
        ASIR: {
            type: Number,
            default: null
        },
        pricingGrade: {
            type: String,
            default: function () {
                if (this.ASIR) {
                    return "ASIR"
                } else {
                    return null;
                }
            }
        },
        sampleIdentification: {
            type: String,
            default: null
        },
        rmaFeeRWF: {
            type: Number,
            default: null
        },
        USDRate: {
            type: Number,
            default: null
        },
        rmaFeeDecision: {
            type: String,
            default: "pending"
        },
        pricePerUnit: {
            type: Number,
            default: null
        },
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
            date: {
                type: Date,
                default: null
            }
        },
        gradeImg: {
            filename: {
                type: String,
                default: null
            },
            createdAt: {
                type: Date,
                default: null
            },
            filePath: {
                type: String,
                default: null
            },
            fileId: {
                type: String,
                default: null
            }
        },
        comment: {
            type: String,
            default: null
        },

        // SPECIFIC FIELDS
        tantal: {
            type: Number,
            default: null
        },
        niobium: {
            type: Number,
            default: null
        },
        iron: {
            type: Number,
            default: null
        },

        // CASSITERITE
        londonMetalExchange: {
            type: Number,
            default: null
        },
        treatmentCharges: {
            type: Number,
            default: null
        },
        // WORLFRAMITE
        metricTonUnit: {
            type: Number,
            default: null
        }
    }, {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

lotSchema.virtual('shipmentHistory', {
    ref: 'LotShipment',
    localField: '_id',
    foreignField: 'lotId',
    justOne: false
});

lotSchema.pre('save', async function (next) {
    const {
        rmaFeeCassiterite,
        rmaFeeLithium,
        rmaFeeColtan,
        rmaFeeWolframite,
        rmaFeeBeryllium
    } = await Settings.findOne();

    // Handle price per unit calculations for different mineral types
    const modelName = this.docModel.toLowerCase();
    const gradeField = decidePricingGrade(this.pricingGrade);
    const grade = this[gradeField];


    // Calculate price per unit based on mineral type
    if (!this.isNew) {
        let shouldCalculatePricePerUnit = false;
        let params = {};

        switch (modelName) {
            case 'cassiterite':
                if (this.isModified(["ASIR", "mineralGrade", "londonMetalExchange", "treatmentCharges"]) && grade && this.londonMetalExchange && this.treatmentCharges) {
                    console.log('asir modified')
                    params = {
                        LME: this.londonMetalExchange,
                        grade,
                        TC: this.treatmentCharges
                    };
                    shouldCalculatePricePerUnit = true;
                }
                break;

            case 'coltan':
                if (this.isModified(["ASIR", "mineralGrade", "tantal"]) && grade && this.tantal) {
                    console.log('asir was changed');
                    params = {
                        tantal: this.tantal,
                        grade
                    };
                    shouldCalculatePricePerUnit = true;
                }
                break;

            case 'wolframite':
                if (this.isModified(["ASIR", "mineralGrade", "metricTonUnit"]) && grade && this.metricTonUnit) {
                    params = {
                        MTU: this.metricTonUnit,
                        grade
                    };
                    shouldCalculatePricePerUnit = true;
                }
                break;

            case 'lithium':
            case 'beryllium':
                // For lithium and beryllium, we don't need to calculate price per unit,
                // as it's directly set by the client
                break;
        }

        if (shouldCalculatePricePerUnit) {
            console.log('should change price')
            this.pricePerUnit = calculatePricePerUnit(modelName, params);
        }
    }

    // Calculate mineral price if we have price per unit and weight out
    if (this.isModified(['pricePerUnit', 'weightOut']) && this.pricePerUnit && this.weightOut) {
        console.log('price changed')
        this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
    }

    // Calculate RMA fee based on mineral type
    let rmaFee = 0;
    switch (modelName) {
        case 'cassiterite': rmaFee = rmaFeeCassiterite; break;
        case 'coltan': rmaFee = rmaFeeColtan; break;
        case 'lithium': rmaFee = rmaFeeLithium; break;
        case 'beryllium': rmaFee = rmaFeeBeryllium; break;
        case 'wolframite': rmaFee = rmaFeeWolframite; break;
    }

    if (this.isModified('weightOut') && this.weightOut && rmaFee) {
        this.rmaFeeRWF = this.weightOut * rmaFee;
    }

    next();
});

lotSchema.pre(/^find/, async function (next) {
    this.populate({path: 'shipmentHistory', model: "LotShipment"})
        // .populate({path: 'entry'});
    next();
})

lotSchema.virtual('settled').get(function () {
    if (!this.netPrice) return false;
    if (this.unpaid === 0 || this.paid === this.netPrice) return true;
})

lotSchema.virtual('rmaFeeUSD').get(function () {
    if (this.rmaFeeRWF && this.USDRate) {
        return (this.rmaFeeRWF / this.USDRate).toFixed(5);
    } else {
        return null;
    }

})

lotSchema.virtual('netPrice').get(function () {
    if (this.mineralPrice && this.rmaFeeUSD) {
        return (this.mineralPrice - parseFloat(this.rmaFeeUSD)).toFixed(5);
    } else {
        return null;
    }

})
lotSchema.virtual('unpaid').get(function () {
    if (!this.netPrice) return null;
    return (parseFloat(this.netPrice) - parseFloat(this.paid)).toFixed(5);

})

// lotSchema.virtual('paid').get(function () {
//     if (!this.paymentHistory.length) return 0;
//     return this.paymentHistory.reduce((acc, curr) => {
//         if (curr.paymentAmount) {
//             return acc + curr.paymentAmount;
//         } else {
//             return acc;
//         }
//     }, 0);
// })

// lotSchema.virtual('exportedAmount').get(function () {
//     if (!this.shipmentHistory.length) return 0;
//     return this.shipmentHistory.reduce((acc, curr) => {
//         return acc + curr.weight;
//     }, 0);
// })


// lotSchema.virtual('cumulativeAmount').get(function () {
//     if (this.nonSellAgreement.weight > 0) return 0;
//     if (!this.shipmentHistory.length) return this.weightOut;
//     return this.weightOut - this.exportedAmount;
// })


// lotSchema.virtual('status').get(function () {
//     if (this.nonSellAgreement.weight > 0) {
//         return "non-sell agreement";
//     } else if (this.cumulativeAmount > 0) {
//         return "in stock";
//     } else if (this.shipmentHistory.length > 0 && this.cumulativeAmount === 0) {
//         return "sold out";
//     }
// })


module.exports = mongoose.model('Lot', lotSchema);