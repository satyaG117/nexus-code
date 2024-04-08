const router = require('express').Router();

const { schemaValidator } = require('../middlewares/input-validation');
const { projectSchema, codeSchema } = require('../utils/validation-schemas')
const { isLoggedIn, decodeToken } = require('../middlewares/auth');
const {
    getProject,
    getProjects,
    updateProjectDetails,
    deleteProject,
    createNewProject,
    saveProject,
    forkProject,
    toggleLike, getUserProjects, getUserLikedProjects, getLikedProjects } = require('../controllers/project-controller');


// router.get('/test', getLikedProjects);
router.post('/', isLoggedIn, schemaValidator(projectSchema), createNewProject);
router.get('/', decodeToken, getProjects);

router.get('/:projectId', decodeToken, getProject);
router.patch('/:projectId', isLoggedIn, schemaValidator(projectSchema), updateProjectDetails);
router.delete('/:projectId', isLoggedIn, deleteProject);

router.patch('/:projectId/updateCode', isLoggedIn, schemaValidator(codeSchema), saveProject)
router.post('/:projectId/fork', isLoggedIn, forkProject)
router.post('/:projectId/like', isLoggedIn, toggleLike);

// get user projects
router.get('/user/:userId', decodeToken, getUserProjects);
router.get('/user/:userId/liked', decodeToken, getUserLikedProjects);



module.exports = router;