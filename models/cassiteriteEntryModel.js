const mongoose = require('mongoose');
const { entrySchema, lotSchema } = require('../models/entryModel');

const cassiteriteLotSchema = lotSchema.clone();
cassiteriteLotSchema.add(
    {
        londonMetalExchange: {
            type: Number,
            default: null
        },
        treatmentCharges: {
            type: Number,
            default: null
        }
    }
)

const cassiteriteSchema = entrySchema.clone();
cassiteriteSchema.add({
    output:  {
        type: [cassiteriteLotSchema],
        default: []
    }
})


cassiteriteLotSchema.pre('save', async function (next) {
    const { decidePricingGrade } = require('../utils/helperFunctions');
    const Settings = require('../models/settingsModel');
    if (this.isModified(["pricingGrade", "londonMetalExchange", "treatmentCharges", "mineralGrade", "ASIR"]) && !this.isNew) {
        if (this[decidePricingGrade(this.pricingGrade)] && this.londonMetalExchange && this.treatmentCharges) {
            this.pricePerUnit = (((this.londonMetalExchange * (this[decidePricingGrade(this.pricingGrade)]/100)) - this.treatmentCharges)/1000);
        }
    }
    if (this.isModified('pricePerUnit') && !this.isNew) {
        if (this.pricePerUnit && this.weightOut) {
            this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
        }
    }
    if (this.isModified('weightOut')) {
        const { rmaFeeCassiterite } = await Settings.findOne();
        if (this.weightOut && rmaFeeCassiterite) {
            this.rmaFeeRWF = this.weightOut * rmaFeeCassiterite;
        }
    }
    next();
})

cassiteriteSchema.statics.findCurrentStock = async function () {
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
    };}

module.exports = mongoose.model('Cassiterite', cassiteriteSchema);