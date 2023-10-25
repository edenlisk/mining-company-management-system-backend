// gross, net, company name, license number, company representative, representative ID number,
//     representative phone number, date, type of minerals (cassiterite, coltan, wolframite, berylium,
//     lithium, mixed minerals), number of mine tags

const mongoose = require('mongoose');

exports.entry = {
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        // required: true
    },
    mineralType: {
        type: String
    },
    companyName: {
        type: String,
    },
    licenseNumber: {
        type: String
    },
    TINNumber: {
        type: String
    },
    companyRepresentative: {
        type: String,
        // required: [true, "Please provide company representative"]
    },
    beneficiary: {
        type: String
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
    time: {
        type: String
    },
    visible: {
        type: Boolean,
        default: true
    },
    // editRequestedAt: Date,
    // editExpiresAt: Date,
    // editableFields: {
    //     type: [String],
    //     default: []
    // }
}


// const entrySchema = new mongoose.Schema(
//     {
//         mineralSupplied: {
//             type: String,
//             enum: ["cassiterite", "coltan", "wolframite", "beryllium", "lithium", "mixed minerals"]
//         },
//         mineralPrice: {
//             type: Number,
//             validate: {
//                 validator: (elem) => {
//                     return elem >= 0;
//                 },
//                 message: "Mineral price can't be negative number"
//             }
//         },
//     }, {
//         timestamps: true
//     }
// )

// TODO 1: FIND CONVENIENT WAY OF STRUCTURING TYPE OF MINERALS AND ITS QUANTITY

// entrySchema.pre('save', async function (next) {
//     if (this.isNew) {
//         if (this.mineralSupplied.toLowerCase() === "coltan") {
//             this.LME = undefined;
//             this.TC = undefined;
//             // this.mineralPrice = this.tantal * this.mineralGrade;
//         } else if (this.mineralSupplied.toLowerCase() === "cassiterite") {
//             this.tantal = undefined;
//             // this.mineralPrice = ((this.LME * (this.mineralGrade)/100) - this.TC)/1000;
//         }
//     }
//     next()
// })

// entrySchema.pre('save', async function (next) {
//     if (this.isModified('supplierId') && !this.isNew) {
//         const supplier = await Supplier.findById(this.supplierId);
//         if (!supplier) return next(new AppError("The Selected supplier no longer exists!", 400));
//         this.companyName = supplier.companyName;
//         this.licenseNumber = supplier.licenseNumber;
//         this.representativeId = supplier.representativeId;
//         this.representativePhoneNumber = supplier.representativePhoneNumber;
//         this.TINNumber = supplier.TINNumber;
//         this.district = supplier.address.district;
//     }
//     next();
// })


// module.exports = mongoose.model('Entry', entrySchema);

