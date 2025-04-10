const mongoose = require('mongoose');
const { lotSchema, entrySchema } = require('../models/entryModel');

const lithiumLotSchema = lotSchema.clone();
lithiumLotSchema.remove('rmaFeeDecision');
lithiumLotSchema.add(
    {
        rmaFeeDecision: {
            type: String,
            default: "exempted"
        }
    }
)

const lithiumSchema = entrySchema.clone();
lithiumSchema.remove(["mineTags", "negociantTags", "numberOfTags"]);
lithiumSchema.add(
    {
        output: {
            type: [lithiumLotSchema],
            default: []
        }
    }
)


lithiumLotSchema.pre('save', async function (next) {
    const { decidePricingGrade } = require("../utils/helperFunctions");
    const Settings = require('../models/settingsModel');
    if (this.isModified(['pricingGrade', 'pricePerUnit', 'weightOut']) && !this.isNew) {
        if (this[decidePricingGrade(this.pricingGrade)] && this.weightOut) {
            this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
        }
    }
    if (this.isModified('weightOut')) {
        const { rmaFeeLithium } = await Settings.findOne();
        this.rmaFeeRWF = this.weightOut * rmaFeeLithium ? rmaFeeLithium : 0;
    }
    next();
})

lithiumSchema.statics.findCurrentStock = async function () {
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


module.exports = mongoose.model('Lithium', lithiumSchema);
