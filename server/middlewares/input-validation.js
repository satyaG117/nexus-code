const HttpError = require('../models/HttpError')

module.exports.schemaValidator = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                console.log(error);
                return next(new HttpError(400, "Invalid Input"));
            }
            next();
        } catch (err) {
            console.log(err);
            return next(new HttpError(500, "Server error"));
        }
    }
}