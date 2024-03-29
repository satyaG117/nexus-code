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
        req.userData = payload;
        return next();
    } catch (err) {
        console.log(err);
        return next(new HttpError(401, 'Token verification failed'))
    }
}

// the difference between decodeToken and isLoggedIn is that this function doesn't throw any error when there is no token
module.exports.decodeToken = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        if (req.headers?.authorization) {
            const token = req.headers.authorization;
            if (token) {
                const payload = jwt.verify(token, process.env.JWT_KEY);
                console.log("Payload : ", payload);
                // attach payload to the req object
                req.userData = payload;
            }
        }

    } catch (err) {
        console.log(err);
    }
    next();
}
