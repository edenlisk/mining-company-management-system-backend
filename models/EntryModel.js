// gross, net, company name, license number, company representative, representative ID number,
//     representative phone number, date, type of minerals (cassiterite, coltan, wolframite, berylium,
//     lithium, mixed minerals), number of mine tags

const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
        },
        licenseNumber: {
            type: String
        },
        companyRepresentative: {
            type: String,
            required: [true, "Please provide company representative"]
        },
        representativeId: {
            type: String,
            immutable: true,
        },
        representativePhoneNumber: {
            type: String
        },
        supplyDate: {
            type: Date
        },
        mineralSupplied: {
            type: String,
            enum: ["cassiterite", "coltan", "wolframite", "beryllium", "lithium", "mixed minerals"]
        },
        numberOfTags: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Number of tags can't be negative number"
            }
        },
        grossQuantity: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Gross quantity can't be negative number"
            }
        },
        netQuantity: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Net quantity can't be negative number"
            }
        },
        mineTags: [String],
        negociantTags: [String],
        mineralGrade: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Grade can't be negative number"
            }
        },
        rmaFee: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Rwanda Mining Association fee can't be negative number"
            }
        },
        mineralPrice: {
            type: Number,
            validate: {
                validator: (elem) => {
                    return elem >= 0;
                },
                message: "Mineral price can't be negative number"
            }
        },
        status: {
            type: String,
            enum: ["in stock", "exported"],
            default: () => {
                return "in stock"
            }
        }
    }, {
        timestamps: true
    }
)

module.exports = mongoose.model('Entry', entrySchema);

