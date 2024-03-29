const router = require('express').Router();

const {loginUser, signupUser} = require('../controllers/user-controller');
const { schemaValidator } = require('../middlewares/input-validation');
const {signupSchema} = require('../utils/validation-schemas')

router.post('/signup', schemaValidator(signupSchema) ,signupUser)

router.post('/login', loginUser)

module.exports = router;