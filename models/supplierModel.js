const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            unique: true
        },
        TINNumber: {
            type: String,
            unique: true
        },
        licenseNumber: {
            type: String,
            unique: true
        },
        email: {
            type: String
        },
        nationalId: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        address: {
            province: String,
            district: String,
            sector: String
        },
        mineSites: {
            type: [
                {
                    name: String,
                    code: String,
                    coordinates: {
                        lat: String,
                        long: String
                    },
                }
            ]
        },
        numberOfDiggers: Number,
        numberOfWashers: Number,
        numberOfTransporters: Number,
        typeOfMinerals: [String],
        status: {
            type: String
        },
        observations: [String]
    },
    {timestamps: true}
)

module.exports = mongoose.model('Supplier', supplierSchema);