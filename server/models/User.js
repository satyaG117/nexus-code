const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxLength: 128,
        match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,128}$/
    },
    createdAt: {
        type: 'Date',
        default: Date.now,
        immutable: true
    },
})

module.exports = mongoose.model('User', userSchema);