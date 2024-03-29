const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
    project:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Project'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true // doesn't change after creation
    }
})

module.exports = mongoose.model('Like', likeSchema);