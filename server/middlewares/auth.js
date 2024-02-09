const jwt = require('jsonwebtoken')

const HttpError = require('../models/HttpError')

module.exports.isLoggedIn = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        const token = req.headers.authorization;
        // console.log(token);
        if (!token) {
            throw new Error('No session detected');
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        // console.log(payload);

        // extract data to be used later
        req.userData =  payload;
        return next();
    } catch (err) {
        console.log(err);
        return next(new HttpError(401, 'Token verification failed'))
    }
}
