const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        rmaFeeWolframite: {
            type: Number,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for wolframite can't be negative number"
            },
        },
        rmaFeeCassiterite: {
            type: Number,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for cassiterite can't be negative number"
            },
        },
        rmaFeeColtan: {
            type: Number,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for coltan can't be negative number"
            },
        },

    }
)


module.exports = mongoose.model('Settings', settingsSchema)