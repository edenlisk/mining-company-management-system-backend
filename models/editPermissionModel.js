const mongoose = require('mongoose');
const Settings = require('./settingsModel');
const User = require('./usersModel');


const editPermissionSchema = new mongoose.Schema(
    {
        editRequestedAt: {
            type: Date,
            immutable: true
        },
        editExpiresAt: Date,
        fulfilledAt: Date,
        editableFields: {
            type: [
                {
                    fieldname: String,
                    initialValue: mongoose.Schema.Types.Mixed,
                    newValue: mongoose.Schema.Types.Mixed
                }
            ],
            default: []
        },
        decision: {
            type: Boolean
        },
        requestStatus: {
            type: String,
            enum: ["pending", "authorized", "rejected", "expired"],
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
    }, {
        timestamps: true
    }
)

editPermissionSchema.pre('save', async function (next) {
    const user = await User.findOne({ username: this.username }).select('+notifications');
    if (this.isNew) {
        this.editRequestedAt = new Date();
        if (user) {
            user.notifications.push(
                {
                    message: `Your Edit Request has been sent successfully.`
                }
            )
        }
    }
    if (this.isModified('decision') && !this.isNew) {
        const { editExpiresIn } = await Settings.findOne();
        if (this.decision === true) {
            this.editExpiresAt = new Date(new Date().getTime() + editExpiresIn * 60000);
            this.requestStatus = "authorized";
            if (user) {
                user.notifications.push(
                    {
                        message: `Your edit request has been authorized. 
                        \n You can use this link to edit the record: 
                        \n **/entry/edit/${this.model}/${this.recordId}/${this._id}**
                        \n This link will expire at ${this.editExpiresAt}
                        `
                    }
                )
            }
        } else if (this.decision === false) {
            this.editExpiresAt = null;
            this.requestStatus = "rejected";
            if (user) {
                user.notifications.push(
                    {
                        message: `Your edit request has been rejected.`
                    }
                )
            }
        }
    }
    await user.save({validateModifiedOnly: true});
    next();
})


module.exports = mongoose.model("EditPermission", editPermissionSchema);