const mongoose = require('mongoose');
const { entrySchema, lotSchema } = require('../models/entryModel');

const coltanLotSchema = lotSchema.clone();
coltanLotSchema.add(
    {
        tantal: {
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

const coltanSchema = entrySchema.clone();
coltanSchema.add({
    output:  {
        type: [coltanLotSchema],
        default: []
    },
})

coltanSchema.set('toObject', { virtuals: true });
coltanSchema.set('toJSON', { virtuals: true });

coltanLotSchema.pre('save', async function(next) {
    const {decidePricingGrade} = require("../utils/helperFunctions");
    const Settings = require('../models/settingsModel');
    if (this.isModified(["pricingGrade", "tantal", "mineralGrade", "ASIR"]) && !this.isNew) {
        if (this[decidePricingGrade(this.pricingGrade)] && this.tantal) {
            this.pricePerUnit = this.tantal * this[decidePricingGrade(this.pricingGrade)];
        }
    }
    if (this.isModified('pricePerUnit') && !this.isNew) {
        if (this.pricePerUnit && this.weightOut) {
            this.mineralPrice = (this.pricePerUnit * this.weightOut).toFixed(5);
        }
    }
    if (this.isModified(["weightOut"])) {
        const { rmaFeeColtan } = await Settings.findOne();
        if (this.weightOut && rmaFeeColtan) {
            this.rmaFeeRWF = this.weightOut * rmaFeeColtan;
        }
    }
    next();
})


coltanSchema.pre('save', async function (next) {
    const { handleChangeSupplier, handlePaidSpecific } = require('../utils/helperFunctions');
    await handleChangeSupplier(this, next);
    if (this.isModified('output') && !this.isNew) {
        if (this.output) handlePaidSpecific(this.output);
    }
    next();
    // formula = tantal * grade
})

coltanSchema.statics.findCurrentStock = async function () {
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


coltanSchema.methods.requestEditPermission = function (editExpiresIn = 30) {
    this.editRequestedAt = Date.now();
    this.editExpiresAt = this.editRequestedAt + (editExpiresIn * 60000);
}


module.exports = mongoose.model('Coltan', coltanSchema);