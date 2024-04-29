const  mongoose  = require('mongoose');
const Invite = require('../models/Invite');
const User = require('../models/User')
const Project = require('../models/Project');
const HttpError = require('../models/HttpError')


module.exports.inviteUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const { projectId } = req.body;

        console.log(req.body)

        // check if invite already exists
        const invite = await Invite.findOne({userId, projectId});
        if(invite){
            return next(new HttpError(409, 'Invite to the user already exists'));
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError(404, 'Project Not Found'));
        }

        // check for author
        if (project.author.toString() !== req.userData.userId) {
            return next(new HttpError(401, 'Unauthorized to perform the action'))
        }

        // author can't send invite to themself
        if(project.author.toString === userId){
            return next(new HttpError(400, 'Cannot invite yourself'));
        }

        // check if already a contributor
        const userIdObject = new mongoose.Types.ObjectId(userId);
        const containsId = project.contributors.some(id => id.equals(userIdObject));

        if(containsId){
            return next(new HttpError(403, 'User already a contributor'));
        }

        // check if we have room  for any new contributors
        if (project.contributors && project.contributors.length >= 3) {
            return next(new HttpError(403, 'Maximum limit for contributors is reached'));
        }

        const user = await User.findById(userId);

        if (!user) {
            return next(new HttpError(404, 'User not found'));
        }

        const newInvite = new Invite({
            project: projectId,
            user: userId
        })

        await newInvite.save();
        res.status(201).json({
            _id : newInvite._id,
            project : {
                _id : project._id,
                title : project._id
            },
            user : {
                _id : user._id,
                username : user.username
            }
        })
    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'));
    }
}

module.exports.deleteInvite = async (req, res, next) => {
    try {
        const { inviteId } = req.params;
        const invite = await Invite.findById(inviteId).populate('project');

        if (!invite) {
            return next(new HttpError(404, 'Invite not found'));
        }

        if (req.userData.userId !== invite.project.author.toString() && req.userData.userId !== invite.user.toString()) {
            return next(new HttpError(401, 'Unauthorized to perform the action'));
        }

        await Invite.findByIdAndDelete(inviteId);
        res.status(200).json({
            message: 'Invite deleted successfully'
        })
    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'));
    }
}

module.exports.getInvitesByUserId = async (req, res, next) => {
    try {
        const {userId} = req.params;
        let aggregationPipeline = [
            {
                '$match': {
                    'user': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project',
                    'foreignField': '_id',
                    'as': 'project'
                }
            }, {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'project.author',
                    'foreignField': '_id',
                    'as': 'project.author'
                }
            }, {
                '$unwind': {
                    'path': '$project.author',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$project': {
                    'user.username': 1,
                    'user._id': 1,
                    'project._id': 1,
                    'project.title': 1,
                    'project.author.username': 1,
                    'project.author._id': 1
                }
            }
        ]

        // only the user to which this is addressed to can see this
        if (req.userData.userId !== userId) {
            return next(new HttpError(401, 'Unauthorized to access data'));
        }

        const invites = await Invite.aggregate(aggregationPipeline);

        res.status(200).json(invites);

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'));
    }
}

module.exports.getInvitesByProjectId = async (req, res, next) => {
    try {
        const {projectId} = req.params;
        console.log(projectId)
        let aggregationPipeline = [
            {
                '$match': {
                    'project': new mongoose.Types.ObjectId(projectId)
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project',
                    'foreignField': '_id',
                    'as': 'project'
                }
            }, {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'project.author',
                    'foreignField': '_id',
                    'as': 'project.author'
                }
            }, {
                '$unwind': {
                    'path': '$project.author',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$project': {
                    'user.username': 1,
                    'user._id': 1,
                    'project._id': 1,
                    'project.title': 1,
                    'project.author.username': 1,
                    'project.author._id': 1
                }
            }
        ]

        const invites = await Invite.aggregate(aggregationPipeline);
        if (invites.length === 0) {
            return res.status(200).json([]);
        }

        // only the project author can see the invites sent
        if (req.userData.userId !== invites[0].project.author._id.toString()) {
            return next(new HttpError(401, 'Unauthorized to access data'));
        }

        res.status(200).json(invites);

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'));
    }
}

module.exports.acceptInvite = async (req, res, next) => {
    try {
        const { inviteId } = req.params;
        const invite = await Invite.findById(inviteId).populate('project');

        if(!invite){
            return next(new HttpError(404, 'Invite not found'));
        }

        // if the invite isn't addressed to the current user
        if (invite.user.toString() !== req.userData.userId) {
            return next(new HttpError(401, 'Unauthorized to perform the action'));
        }

        // if the list is full
        if (invite.project.contributors.length >= 3) {
            return next(new HttpError(403, 'Maximum limit for contributors is reached'));
        }

        // if all good then add the userId to the contributor list
        await Project.updateOne({ _id: invite.project }, { $push: { contributors: invite.user } });
        //delete invite after you are done
        await Invite.findByIdAndDelete(inviteId);

        res.status(200).json({
            message: 'Invitation accepted successfully'
        })
    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'));
    }
}