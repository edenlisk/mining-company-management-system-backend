const mongoose = require('mongoose');
const {entrySchema, lotSchema} = require('../models/entryModel');

const wolframiteLotSchema = lotSchema.clone();
wolframiteLotSchema.add(
    {
        metricTonUnit: {
            type: Number,
            default: null
        }
    }
);

const wolframiteSchema = entrySchema.clone();
wolframiteSchema.add({
    output: {
        type: [wolframiteLotSchema],
        default: []
    }
})


wolframiteLotSchema.pre('save', async function (next) {
    const {decidePricingGrade} = require("../utils/helperFunctions");
    const Settings = require('../models/settingsModel');
    if (this.isModified(['pricingGrade', 'metricTonUnit', 'mineralGrade', 'ASIR']) && !this.isNew) {
        if (this[decidePricingGrade(this.pricingGrade)] && this.metricTonUnit) {
            this.pricePerUnit = ((this.metricTonUnit * this[decidePricingGrade(this.pricingGrade)] / 100) * 0.1);
        }
    }
    if (this.isModified("pricePerUnit") && !this.isNew) {
        if (this.pricePerUnit && this.metricTonUnit) {
            this.mineralPrice = this.pricePerUnit * this.metricTonUnit;
        }
    }
    if (this.isModified('weightOut')) {
        const {rmaFeeWolframite} = await Settings.findOne();
        if (this.weightOut && rmaFeeWolframite) {
            this.rmaFeeRWF = this.weightOut * rmaFeeWolframite;
        }
    }
    next();
})

wolframiteSchema.statics.findCurrentStock = async function () {
    const result = await this.find(
        {
            $and: [
                {
                    $expr: {
                        $gt: ['$output.cumulativeAmount', 0]
                    }
                },
            ]
        }
    );
    return {
        entries: result,
        balance: result.reduce((acc, curr) => acc + curr.output.reduce((acc, curr) => acc + curr.cumulativeAmount, 0), 0)
    };
}

module.exports = mongoose.model('Wolframite', wolframiteSchema);

