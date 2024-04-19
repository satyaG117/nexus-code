const mongoose = require('mongoose');
const { Schema } = mongoose;
const Like = require('../models/Like')
const HttpError = require('../models/HttpError')

const projectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    code: {
        html: {
            type: String,
        },
        css: {
            type: String
        },
        js: {
            type: String
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    forkedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true // doesn't change after creation
    },
    lastEditedAt: {
        type: Date,
        require: true,
        default: Date.now
    }
})

projectSchema.pre('save', function (next) {
    this.lastEditedAt = new Date();
    next();
})

projectSchema.pre('findOneAndDelete', async function (next) {
    try {
        console.log('In pre middleware')
        console.log(this.getQuery()._id);
        const projectId = this.getQuery()._id;
        await Like.deleteMany({project : projectId})
        next();
    } catch (err) {
        console.log(err);
        next(new HttpError(500, "Server error"));
    }
})

module.exports = mongoose.model('Project', projectSchema);