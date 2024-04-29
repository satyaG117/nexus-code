const router = require('express').Router();

const {loginUser, signupUser, getUser, searchUsersByUsername} = require('../controllers/user-controller');
const { schemaValidator } = require('../middlewares/input-validation');
const {signupSchema} = require('../utils/validation-schemas')

router.post('/signup', schemaValidator(signupSchema) ,signupUser)

router.get('/search', searchUsersByUsername);

router.post('/login', loginUser)

router.get('/:userId' , getUser)


module.exports = router;