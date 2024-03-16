const Joi = require('joi')

const {validateUsername , validatePassword} = require('./custom-validations');

const loginSchema = Joi.object().keys({
    email : Joi.string().required().email(),
    password : Joi.string().required().custom(validatePassword , 'password-validation').min(8),
})

// extends the login schema
const signupSchema = loginSchema.keys({
    username : Joi.string().required().custom(validateUsername , 'username-validation')
})

const projectSchema = Joi.object().keys({
    title : Joi.string().required(),
    description : Joi.string()
})

module.exports = {loginSchema, signupSchema, projectSchema}