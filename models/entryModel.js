const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            // required: [true, "Please you must select supplier"]
        },
        mineralType: {
            type: String,
            required: true,
            enum: ['coltan', 'cassiterite', 'wolframite', 'lithium', 'beryllium', 'mixed'],
            immutable: true,
        },
        model: {
            type: String,
            required: true,
            lowercase: true,
        },
        beneficiary: {
            type: String,
            default: null
        },
        numberOfTags: {
            type: Number,
            default: null
        },
        weightIn: {
            type: Number,
            default: null
        },
        supplyDate: {
            type: Date
        },
        time: {
            type: String
        },
        comment: {
            type: String,
            default: null
        },
        visible: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
)

entrySchema.virtual('output', {
    ref: 'Lot',
    localField: '_id',
    foreignField: 'entry',
    justOne: false,
});

entrySchema.pre('save', async function (next) {
    const { handleChangeSupplier } = require('../utils/helperFunctions');
    if (this.isModified('supplierId') && !this.isNew) {
        await handleChangeSupplier(this, next);
    }
})

entrySchema.pre(/^find/, async function (next) {
    this.populate({path: 'mineTags', model: 'Tag', strictPopulate: false})
        .populate({path: 'negociantTags', model: 'Tag', strictPopulate: false})
        .populate({path: 'output'})
        .populate({path: 'supplierId', model: 'Supplier'});

    next();
})


module.exports = mongoose.model('Entry', entrySchema);
