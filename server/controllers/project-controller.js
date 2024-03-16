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