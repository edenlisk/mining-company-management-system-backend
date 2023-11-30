const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const tagsSchema = new mongoose.Schema(
    {
        tagNumber: {
            type: String,
            unique: true,
            required: [true, "Please provide tag number"]
        },
        tagType: {
            type: String,
            enum: ["mine", "negociant"],
        },
        sheetNumber: {
            type: String,
            default: null
        },
        entryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coltan" || "Wolframite" || "Cassiterite"
        },
        status: {
            type: String,
            enum: ["in store", "out of store"],
            default: "in store"
        },
        weight: {
            type: Number,
        },
        registrationDate: {
            type: Date,
            default: () => new Date()
        },
        exportDate: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model('Tag', tagsSchema);