const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        members: {
            type: Array,
            unique: true
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Chat', chatSchema);