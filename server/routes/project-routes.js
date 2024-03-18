const router = require('express').Router();

const { schemaValidator } = require('../middlewares/input-validation');
const {projectSchema} = require('../utils/validation-schemas')
const {isLoggedIn} = require('../middlewares/auth');
const { createNewPost, getProject, getProjects, updateProjectDetails, deleteProject } = require('../controllers/project-controller');

router.post('/', isLoggedIn, schemaValidator(projectSchema), createNewPost);
router.get('/', getProjects);

router.get('/:projectId', getProject);
router.patch('/:projectId',isLoggedIn, schemaValidator(projectSchema), updateProjectDetails);
router.delete('/:projectId', isLoggedIn, deleteProject);

module.exports = router;