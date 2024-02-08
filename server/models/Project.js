const mongoose = require('mongoose');
const {Schema} = mongoose;

const projectSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
    },
    code : {
        html : {
            type : String,
        },
        css : {
            type : String
        },
        js : {
            type : String
        }
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    forkedFrom : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project'
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

projectSchema.pre('save', function(next){
    this.lastEditedAt = new Date();
    next();
})

module.exports = mongoose.model('Project',projectSchema);