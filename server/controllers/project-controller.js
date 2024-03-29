const HttpError = require('../models/HttpError');
const Project = require('../models/Project');
const Like = require('../models/Like');
const { default: mongoose } = require('mongoose');

module.exports.createNewProject = async (req, res, next) => {
    try {
        const newProject = new Project({ ...req.body, author: req.userData.userId, code: { html: '', css: '', js: '' } });
        await newProject.save();
        res.status(201).json(newProject)
    } catch (err) {
        next(new HttpError(500, 'Failed to create new project, Try again.'));
    }
}

module.exports.getProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let project
        // const project = await Project.findById(projectId).populate('author', '-password -email -__v');
        if (req.userData) {
            project = await Project.aggregate([
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(projectId)
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'author',
                        'foreignField': '_id',
                        'as': 'author'
                    }
                }, {
                    '$unwind': {
                        'path': '$author',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$lookup': {
                        'from': 'likes',
                        'localField': '_id',
                        'foreignField': 'project',
                        'as': 'likes'
                    }
                }, {
                    '$addFields': {
                        'isLiked': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': {
                                                '$ifNull': [
                                                    {
                                                        '$filter': {
                                                            'input': '$likes',
                                                            'cond': {
                                                                '$eq': [
                                                                    '$$this.user', new mongoose.Types.ObjectId(req.userData.userId)
                                                                ]
                                                            }
                                                        }
                                                    }, []
                                                ]
                                            }
                                        }, 0
                                    ]
                                },
                                'then': true,
                                'else': false
                            }
                        }
                    }
                }, {
                    '$addFields': {
                        'likesCount': {
                            '$size': '$likes'
                        }
                    }
                }, {
                    '$project': {
                        'stars': 0,
                        'author.password': 0,
                        'author.createdAt': 0,
                        'author.__v': 0
                    }
                }
            ]
            );
        } else {
            project = await Project.aggregate([
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(projectId)
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'author',
                        'foreignField': '_id',
                        'as': 'author'
                    }
                }, {
                    '$unwind': {
                        'path': '$author',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$lookup': {
                        'from': 'likes',
                        'localField': '_id',
                        'foreignField': 'project',
                        'as': 'likes'
                    }
                }, {
                    '$addFields': {
                        'isLiked': false
                    }
                }, {
                    '$addFields': {
                        'likesCount': {
                            '$size': '$likes'
                        }
                    }
                }, {
                    '$project': {
                        'stars': 0,
                        'author.password': 0,
                        'author.createdAt': 0,
                        'author.__v': 0
                    }
                }
            ]
            );
        }
        if (project.length === 0) {
            return next(new HttpError(404, 'Project not found'));
        }
        res.status(200).json(project[0]);
    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Failed to fetch project data'));
    }
}

module.exports.getProjects = async (req, res, next) => {
    try {
        let projects;
        if (req.userData) {
            projects = await Project.aggregate([
                {
                    '$sort': {
                        'createdAt': -1
                    }
                },
                {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'author',
                        'foreignField': '_id',
                        'as': 'author'
                    }
                }, {
                    '$unwind': {
                        'path': '$author',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$lookup': {
                        'from': 'likes',
                        'localField': '_id',
                        'foreignField': 'project',
                        'as': 'likes'
                    }
                }, {
                    '$addFields': {
                        'isLiked': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': {
                                                '$ifNull': [
                                                    {
                                                        '$filter': {
                                                            'input': '$likes',
                                                            'cond': {
                                                                '$eq': [
                                                                    '$$this.user', new mongoose.Types.ObjectId(req.userData.userId)
                                                                ]
                                                            }
                                                        }
                                                    }, []
                                                ]
                                            }
                                        }, 0
                                    ]
                                },
                                'then': true,
                                'else': false
                            }
                        }
                    }
                }, {
                    '$addFields': {
                        'likesCount': {
                            '$size': '$likes'
                        }
                    }
                }, {
                    '$project': {
                        'stars': 0,
                        'author.password': 0,
                        'author.createdAt': 0,
                        'author.__v': 0
                    }
                }
            ]
            );
        } else {
            projects = await Project.aggregate([
                {
                    '$sort': {
                        'createdAt': -1
                    }
                },
                {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'author',
                        'foreignField': '_id',
                        'as': 'author'
                    }
                }, {
                    '$unwind': {
                        'path': '$author',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$lookup': {
                        'from': 'likes',
                        'localField': '_id',
                        'foreignField': 'project',
                        'as': 'likes'
                    }
                }, {
                    '$addFields': {
                        'isLiked': false
                    }
                }, {
                    '$addFields': {
                        'likesCount': {
                            '$size': '$likes'
                        }
                    }
                }, {
                    '$project': {
                        'stars': 0,
                        'author.password': 0,
                        'author.createdAt': 0,
                        'author.__v': 0
                    }
                }
            ]
            );
        }
        if (projects.length === 0) {
            return next(new HttpError(404, 'Projects not found'));
        }
        res.status(200).json(projects);
    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Failed to fetch projects'));
    }
}

module.exports.updateProjectDetails = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let project = await Project.findById(projectId);
        if (!project) {
            return next(new HttpError(404, 'Project not found'));
        }

        if (project.author.toString() !== req.userData.userId) {
            return next(new HttpError(401, 'Unauthorized to perform the action'))
        }

        project = await Project.findByIdAndUpdate(projectId, req.body, { new: true });
        res.status(200).json(project);
    } catch (err) {
        next(new HttpError(500, 'Error encountered while editing'))
    }
}

module.exports.deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError(404, 'Project not found'));
        }

        if (project.author.toString() !== req.userData.userId) {
            return next(new HttpError(401, 'Unauthorized to perform the action'))
        }

        const deletedDocument = await Project.findByIdAndDelete(projectId);
        res.status(200).json(deletedDocument)
    } catch (err) {
        next(new HttpError(500, 'Error encountered while editing'))
    }
}

module.exports.saveProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        if (Object.keys(req.body).length === 0) {
            return next(new HttpError(400, 'Empty request body'))
        }

        let project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError(404, 'Project not found'));
        }

        if (project.author.toString() !== req.userData.userId) {
            return next(new HttpError(401, 'Unauthorized to edit content'))
        }

        project.code = { ...project.code, ...req.body };
        await project.save();

        res.status(200).json({ message: 'Saved successfully' });
    } catch (err) {
        next(new HttpError(500, 'Unknown error encountered while trying to save'));
    }
}

module.exports.forkProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let targetProject = await Project.findById(projectId);

        if (!targetProject) {
            return next(new HttpError(404, 'Project not found'));
        }

        const { title, description, code } = targetProject;
        const newProject = new Project({ title, description, code, author: req.userData.userId, forkedFrom: targetProject._id });

        await newProject.save();

        res.status(201).json({
            message: 'Fork successful',
            forkId: newProject._id
        })

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered while to trying to fork'))
    }
}

module.exports.toggleLike = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let project = await Project.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(projectId)
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'author',
                    'foreignField': '_id',
                    'as': 'author'
                }
            }, {
                '$unwind': {
                    'path': '$author',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$lookup': {
                    'from': 'likes',
                    'localField': '_id',
                    'foreignField': 'project',
                    'as': 'likes'
                }
            }, {
                '$addFields': {
                    'isLiked': {
                        '$cond': {
                            'if': {
                                '$gt': [
                                    {
                                        '$size': {
                                            '$ifNull': [
                                                {
                                                    '$filter': {
                                                        'input': '$likes',
                                                        'cond': {
                                                            '$eq': [
                                                                '$$this.user', new mongoose.Types.ObjectId(req.userData.userId)
                                                            ]
                                                        }
                                                    }
                                                }, []
                                            ]
                                        }
                                    }, 0
                                ]
                            },
                            'then': true,
                            'else': false
                        }
                    }
                }
            }, {
                '$addFields': {
                    'likesCount': {
                        '$size': '$likes'
                    }
                }
            }, {
                '$project': {
                    'stars': 0,
                    'author.password': 0,
                    'author.createdAt': 0,
                    'author.__v': 0
                }
            }
        ]
        );

        if(!project.length === 0){
            return next(new HttpError(404, 'Project Not Found'));
        }

        console.log(project[0].isLiked)
        // if like then un-like
        if(project[0].isLiked){
            console.log('Un-like')
            await Like.deleteOne({user : req.userData.userId, project : projectId});
            res.status(200).json({
                action : 'delete'
            });
        }else{ // add a like
            console.log('Like')
            const like = new Like({user : req.userData.userId , project : projectId});
            await like.save();
            res.status(201).json({
                action : 'create'
            });
        }

    } catch (err) {
        return next(new HttpError(500 , 'Unknown error encountered'));
    }
}