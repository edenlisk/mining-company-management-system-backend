const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minLength: 4,
            maxLength: 50,
            required: [true, "Please provide name"]
        },
        // username: {
        //     type: String,
        //     lowercase: true,
        //     required: [true, "Please provide username"],
        //     minLength: 4,
        //     maxLength: 20
        // },
        phoneNumber: {
            type: String,
            required: [true, "Please provide phone number"],
            unique: true
        },
        email: {
            type: String,
            minLength: 5,
            maxLength: 50,
            required: [true, "Please provide email"],
            unique: true,
            validate: [isEmail, "Please provide valid email"]
        },
        role: {
            type: String,
            required: [true, "Please provide user role"],
            enum: ["managingDirector", "operationsManager", "accountant", "traceabilityOfficer", "storekeeper", "ceo"],
            default: () => {
                return "storekeeper"
            }
        },
        // permissions: {
        //     type: String,
        //     enum: ["storekeeper", "ceo", "managing-director", "operations-manager", "accountant", "traceability-officer"],
        // },
        permissions: {
            type: Object,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minLength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, "You must confirm the password"],
            validate: {
                validator: function (elem) {
                    return this.password === elem;
                },
                message: "Password does not match"
            },
        },
        active: {
            type: Boolean,
            default: () => true
        },
        passwordChangedAt: Date
    },
    {
        indexes: [{unique: true, fields: ['phoneNumber', "email"]}]
    }
);


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.verifyPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

module.exports = mongoose.model('User', userSchema);
