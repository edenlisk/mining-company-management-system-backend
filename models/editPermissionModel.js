const mongoose = require('mongoose');
const Settings = require('../models/settingsModel');


const editPermissionSchema = new mongoose.Schema(
    {
        editRequestedAt: {
            type: Date,
            immutable: true
        },
        editExpiresAt: Date,
        editableFields: {
            type: [
                {
                    fieldname: String,
                    initialValue: mongoose.Schema.Types.Mixed
                }
            ],
            default: []
        },
        decision: {
            type: Boolean
        },
        requestStatus: {
            type: String,
            enum: ["pending", "authorized", "rejected"],
            default: "pending"
        },
        recordId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Please provide record Id"]
        },
        model: {
            type: String,
            required: [true, "Please provide model"]
        },
        username: {
            type: String,
            required: [true, "Please provide username"]
        }
    }
)

editPermissionSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.editRequestedAt = new Date();
        const { editExpiresIn } = await Settings.findOne();
        this.editExpiresAt = new Date(this.editRequestedAt.getTime() + editExpiresIn * 60000);
    }
    if (this.isModified('decision') && !this.isNew) {
        if (this.decision === true) {
            this.requestStatus = "authorized";
        } else if (this.decision === false) {
            this.requestStatus = "rejected";
        }
    }
    next();
})

module.exports = mongoose.model("EditPermission", editPermissionSchema);