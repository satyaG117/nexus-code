const router = require('express').Router();

const { schemaValidator } = require('../middlewares/input-validation');
const { projectSchema, codeSchema } = require('../utils/validation-schemas')
const { isLoggedIn } = require('../middlewares/auth');
const { getProject, getProjects, updateProjectDetails, deleteProject, createNewProject, saveProject } = require('../controllers/project-controller');

router.post('/', isLoggedIn, schemaValidator(projectSchema), createNewProject);
router.get('/', getProjects);

router.get('/:projectId', getProject);
router.patch('/:projectId', isLoggedIn, schemaValidator(projectSchema), updateProjectDetails);
router.delete('/:projectId', isLoggedIn, deleteProject);
router.patch('/:projectId/updateCode', isLoggedIn, schemaValidator(codeSchema), saveProject)

module.exports = router;