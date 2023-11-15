const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../global');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    lastPasswordReset: {
        type: Number,
        default: Date.now
    }
});

const User = mongoose.model(DATABASE_MODELS.USER, userSchema);
module.exports = User;