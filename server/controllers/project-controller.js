const HttpError = require('../models/HttpError');
const Project = require('../models/Project');
const Like = require('../models/Like');
const { mongoose } = require('mongoose');


const SORT_OPTIONS = ['likes-desc', 'likes-asc', 'time-desc', 'time-asc'];

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
        let aggregationPipeline = [
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
                '$lookup': {
                    'from': 'users',
                    'localField': 'contributors',
                    'foreignField': '_id',
                    'as': 'contributors'
                }
            }
        ]

        if (req.userData) {
            aggregationPipeline.push({
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
            })

        } else {
            aggregationPipeline.push({
                '$addFields': {
                    'isLiked': false
                }
            })
        }

        aggregationPipeline.push({
            '$addFields': {
                'likesCount': {
                    '$size': '$likes'
                }
            }
        })

        aggregationPipeline.push({
            '$project': {
                'stars': 0,
                'author.password': 0,
                'author.createdAt': 0,
                'author.__v': 0,
                'contributors.password': 0,
                'contributors.email': 0
            }
        })

        project = await Project.aggregate(aggregationPipeline)


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
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    // page can't be less than 1
    page = page < 1 ? 1 : page;
    // limit should be between 1 to 10 , default is 6
    limit = (limit < 1 || limit > 10) ? 6 : limit;
    try {
        let projects;
        let aggregationPipeline = [
            {
                '$sort': {
                    'createdAt': -1
                }
            }, {
                '$skip': (page - 1) * limit
            }, {
                '$limit': limit
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
            }
        ]
        if (req.userData) {
            aggregationPipeline.push({
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
            })

        } else {
            aggregationPipeline.push({
                '$addFields': {
                    'isLiked': false
                }
            })
        }

        aggregationPipeline.push({
            '$addFields': {
                'likesCount': {
                    '$size': '$likes'
                }
            }
        })

        aggregationPipeline.push({
            '$project': {
                'likes': 0,
                'author.password': 0,
                'author.createdAt': 0,
                'author.__v': 0
            }
        })

        projects = await Project.aggregate(aggregationPipeline)

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

        if (!project.length === 0) {
            return next(new HttpError(404, 'Project Not Found'));
        }

        console.log(project[0].isLiked)
        // if like then un-like
        if (project[0].isLiked) {
            console.log('Un-like')
            await Like.deleteOne({ user: req.userData.userId, project: projectId });
            res.status(200).json({
                action: 'delete'
            });
        } else { // add a like
            console.log('Like')
            const like = new Like({ user: req.userData.userId, project: projectId });
            await like.save();
            res.status(201).json({
                action: 'create'
            });
        }

    } catch (err) {
        return next(new HttpError(500, 'Unknown error encountered'));
    }
}

module.exports.getUserProjects = async (req, res, next) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    // page can't be less than 1
    page = page < 1 ? 1 : page;
    // limit should be between 1 to 10 , default is 6
    limit = (limit < 1 || limit > 10) ? 6 : limit;
    try {
        const { userId } = req.params;
        let aggregationPipeline = [
            {
                '$match': {
                    'author': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            }, {
                '$skip': (page - 1) * limit
            }, {
                '$limit': limit
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
            }
        ]

        if (req.userData) {
            aggregationPipeline.push({
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
            })
        } else {
            aggregationPipeline.push({
                '$addFields': {
                    'isLiked': false
                }
            })
        }

        aggregationPipeline.push({
            '$addFields': {
                'likesCount': {
                    '$size': '$likes'
                }
            }
        })

        aggregationPipeline.push({
            '$project': {
                'likes': 0,
                'author.password': 0,
                'author.createdAt': 0,
                'author.__v': 0
            }
        })

        let projects = await Project.aggregate(aggregationPipeline);
        console.log(projects)
        if (projects.length === 0) {
            return next(new HttpError(404, 'Projects not found'));
        }

        res.status(200).json(projects);

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'))
    }
}

module.exports.getUserLikedProjects = async (req, res, next) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    // page can't be less than 1
    page = page < 1 ? 1 : page;
    // limit should be between 1 to 10 , default is 6
    limit = (limit < 1 || limit > 10) ? 6 : limit;
    try {
        const { userId } = req.params;
        let aggregationPipeline = [
            {
                '$match': {
                    'user': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$sort': {
                    'createdAt': -1
                }
            }, {
                '$skip': (page - 1) * limit
            }, {
                '$limit': limit
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
                '$replaceRoot': {
                    'newRoot': '$project'
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
            }
        ]



        if (req.userData) {
            aggregationPipeline.push({
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
            })
        } else {
            aggregationPipeline.push({
                '$addFields': {
                    'isLiked': false
                }
            })

        }


        aggregationPipeline.push({
            '$addFields': {
                'likesCount': {
                    '$size': '$likes'
                }
            }
        });

        aggregationPipeline.push({
            '$project': {
                'likes': 0,
                'author.password': 0,
                'author.createdAt': 0,
                'author.__v': 0
            }
        });


        // console.log('======================================');
        // console.log(aggregationPipeline);
        // console.log('======================================');



        let projects = await Like.aggregate(aggregationPipeline);
        console.log(projects);

        if (projects.length === 0) {
            return next(new HttpError(404, 'Projects not found'));
        }

        res.status(200).json(projects);

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Unknown error encountered'))
    }
}

module.exports.searchProjects = async (req, res, next) => {
    try {
        let searchTerm = req.query.searchTerm ? req.query.searchTerm : '';
        let sortBy = req.query.sortBy ? req.query.sortBy : 'likes-desc';
        let includeForks = req.query.includeForks ? req.query.includeForks : 'false';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 6;

        // console.log(req.query)

        if (searchTerm == '' || !searchTerm) {
            return res.status(200).json([]);
        }

        // page can't be less than 1
        page = page < 1 ? 1 : page;
        // limit should be between 1 to 10 , default is 6
        limit = (limit < 1 || limit > 10) ? 6 : limit;

        // if not valid string then assign the first one in the array
        if (!SORT_OPTIONS.includes(sortBy)) {
            sortBy = SORT_OPTIONS[0];
        }

        console.log(sortBy)

        let aggregationPipeline = [];

        if (includeForks == 'true') {
            aggregationPipeline.push({
                '$match': {
                    'title': {
                        '$regex': new RegExp(searchTerm, "i")
                    }
                }
            })

        } else {
            aggregationPipeline.push({
                '$match': {
                    'title': {
                        '$regex': new RegExp(searchTerm, "i")
                    },
                    'forkedFrom': null
                }
            })
        }

        if (sortBy == 'time-desc') {
            aggregationPipeline.push({
                '$sort': {
                    'createdAt': -1
                }
            })
        } else if (sortBy == 'time-asc') {
            aggregationPipeline.push({
                '$sort': {
                    'createdAt': 1
                }
            })
        }

        if (sortBy === 'time-desc' || sortBy === 'time-asc') {
            aggregationPipeline.push({
                $skip: (page - 1) * limit
            }
            )
            aggregationPipeline.push({
                $limit: limit
            })
        }

        aggregationPipeline.push({
            '$lookup': {
                'from': 'users',
                'localField': 'author',
                'foreignField': '_id',
                'as': 'author'
            }
        })
        aggregationPipeline.push({
            '$unwind': {
                'path': '$author',
                'preserveNullAndEmptyArrays': false
            }
        })
        aggregationPipeline.push({
            '$lookup': {
                'from': 'likes',
                'localField': '_id',
                'foreignField': 'project',
                'as': 'likes'
            }
        })

        if (req.userData) {
            aggregationPipeline.push({
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
            })

        } else {
            aggregationPipeline.push({
                '$addFields': {
                    'isLiked': false
                }
            })
        }

        aggregationPipeline.push({
            '$addFields': {
                'likesCount': {
                    '$size': '$likes'
                }
            }
        })

        if (sortBy == 'likes-desc') {
            aggregationPipeline.push({
                '$sort': {
                    'likesCount': -1
                }
            })
        } else if (sortBy == 'likes-asc') {
            aggregationPipeline.push({
                '$sort': {
                    'likesCount': 1
                }
            })
        }

        if (sortBy === 'likes-desc' || sortBy === 'likes-asc') {
            aggregationPipeline.push({
                $skip: (page - 1) * limit
            }
            )
            aggregationPipeline.push({
                $limit: limit
            })
        }

        aggregationPipeline.push({
            '$project': {
                'likes': 0,
                'author.password': 0,
                'author.createdAt': 0,
                'author.__v': 0
            }
        })

        let projects = await Project.aggregate(aggregationPipeline)

        console.log('=======================================================')
        console.log(aggregationPipeline)
        console.log('=======================================================')

        if (projects.length === 0) {
            return next(new HttpError(404, 'Projects not found'));
        }
        res.status(200).json(projects);

    } catch (err) {
        console.log(err);
        next(new HttpError(500, 'Failed to fetch projects'));
    }
}

