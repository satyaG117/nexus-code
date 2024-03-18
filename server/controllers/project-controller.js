const HttpError = require('../models/HttpError');
const Project = require('../models/Project');

module.exports.createNewPost = async(req,res,next)=>{
    try{
        const newProject = new Project({...req.body, author : req.userData.userId, code : {html : '', css : '', js : ''} });
        await newProject.save();
        res.status(201).json(newProject) 
    }catch(err){
        next(new HttpError(500,'Failed to create new project, Try again.'));
    }
}

module.exports.getProject = async(req,res,next)=>{
    try{
        const {projectId} = req.params
        const project = await Project.findById(projectId).populate('author', '-password -email -__v');
        if(!project){
            return next(new HttpError(404, 'Project not found'));
        }
        res.status(200).json(project);
    }catch(err){
        next(new HttpError(500, 'Failed to fetch project data'));
    }
}

module.exports.getProjects = async(req,res,next)=>{
    try{
        const projects = await Project.find().populate('author', '-password -email -__v');
        if(projects.length === 0){
            return next(new HttpError(404, 'Projects not found'));
        }
        res.status(200).json(projects);
    }catch(err){
        next(new HttpError(500, 'Failed to fetch projects'));
    }
}

module.exports.updateProjectDetails = async(req,res,next)=>{
    try{
        const {projectId} = req.params;
        let project = await Project.findById(projectId);
        if(!project){
            return next(new HttpError(404, 'Project not found'));
        }

        if(project.author.toString() !== req.userData.userId){
            return next(new HttpError(401, 'Unauthorized to perform the action'))
        }

        project = await Project.findByIdAndUpdate(projectId, req.body, {new : true});
        res.status(200).json(project);
    }catch(err){
        next(new HttpError(500, 'Error encountered while editing'))
    }
}

module.exports.deleteProject = async(req,res,next)=>{
    console.log('Delete project')
    try{
        const {projectId} = req.params;
        let project = await Project.findById(projectId);

        if(!project){
            return next(new HttpError(404, 'Project not found'));
        }

        if(project.author.toString() !== req.userData.userId){
            return next(new HttpError(401, 'Unauthorized to perform the action'))
        }

        const deletedDocument = await Project.findByIdAndDelete(projectId);
        res.status(200).json(deletedDocument)
    }catch(err){
        next(new HttpError(500, 'Error encountered while editing'))
    }
}