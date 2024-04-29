const router = require('express').Router();

const {schemaValidator} = require('../middlewares/input-validation')
const {inviteSchema} = require('../utils/validation-schemas')
const {isLoggedIn} = require('../middlewares/auth')
const {inviteUser, deleteInvite, getInvitesByUserId, getInvitesByProjectId, acceptInvite} = require('../controllers/invite-controller')

router.post('/', isLoggedIn, schemaValidator(inviteSchema), inviteUser);

router.delete('/:inviteId', isLoggedIn, deleteInvite);

router.get('/user/:userId',isLoggedIn, getInvitesByUserId);

router.get('/project/:projectId', isLoggedIn, getInvitesByProjectId);

router.post('/:inviteId' , isLoggedIn, acceptInvite)

module.exports = router;