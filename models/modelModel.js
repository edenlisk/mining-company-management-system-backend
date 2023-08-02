const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema(
    {
        // common properties
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
        // specific for coltan, cassiterite, wolframite
        numberOfTags: Number,
        mineTags: {
            type: [
                {
                    weightInPerMineTag: Number,
                    tagNumber: String,
                    status: String
                }
            ]
        },
        negociantTags: {
            type: [
                {
                    weightOutPerNegociantTag: Number,
                    tagNumber: String,
                    status: String
                }
            ]
        },
        // specific properties
        output: {
            type: [
                {
                    lotNumber: Number,
                    weightOut: Number,
                    mineralGrade: Number,
                    mineralPrice: Number,
                    exportedAmount: Number,
                    cumulativeAmount: Number,
                    rmaFee: Number,
                    paid: Number,
                    unpaid: Number,
                    settled: Boolean,
                    pricePerUnit: Number,
                    status: String,
                },
            ]
        },
    }
)