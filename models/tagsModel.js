const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema(
    {
        tagNumber: {
            type: String,
            immutable: true,
            unique: true,
            maxLength: 7,
            minLength: 7,
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
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
        },
        entryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entry",
            default: null
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
        },
        shipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipment'
        }

    },
    {
        timestamps: true,
        indexes: [{unique: true, fields: ['tagNumber']}]
    }
)

tagsSchema.pre('save', async function (next) {
    if (this.isModified('status') && this.status === "out of store") this.exportDate = new Date();
    next();
})

module.exports = mongoose.model('Tag', tagsSchema);