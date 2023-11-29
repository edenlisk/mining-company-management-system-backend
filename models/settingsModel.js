const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        rmaFeeWolframite: {
            type: Number,
            default: 50,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for wolframite can't be negative number"
            },
        },
        rmaFeeCassiterite: {
            type: Number,
            default: 50,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for cassiterite can't be negative number"
            },
        },
        rmaFeeColtan: {
            type: Number,
            default: 125,
            validate: {
                validator: (value) => {
                    return value >= 0;
                },
                message: "Rwanda Mining Association fee per kg for coltan can't be negative number"
            },
        },
        nameOfCompany: {
            type: String,
            default: () => {
                return "Kanzamin limited"
            }
        },
        representative: {
            type: String,
            default: "Nzaramba Dan"
        },
        address: {
            province: {
                type: String,
                default: "Kigali City",
            },
            district: {
                type: String,
                default: "Kicukiro"
            },
            sector: {
                type: String,
                default: ""
            }
        },
        editExpiresIn: {
            type: Number,
            default: 30
        },
        logsLifeTime: {
            type: Number,
            default: 90
        }
    }
)

// settingsSchema.pre('save', async function (next) {
//     if (this.isModified('editExpiresIn')) {
//
//     }
// })


module.exports = mongoose.model('Settings', settingsSchema);