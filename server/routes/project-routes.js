const router = require('express').Router();

const { schemaValidator } = require('../middlewares/input-validation');
const {projectSchema} = require('../utils/validation-schemas')
const {isLoggedIn} = require('../middlewares/auth');
const { createNewPost, getProject, getProjects } = require('../controllers/project-controller');

router.post('/', isLoggedIn, schemaValidator(projectSchema), createNewPost);
router.get('/', getProjects);

router.get('/:projectId', getProject);


module.exports = router;