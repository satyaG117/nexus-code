const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const User = require('../models/User');
const HttpError = require('../models/HttpError');

const SALT_ROUNDS = 12;

module.exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    let targetUser, isPasswordValid = false, token;
    try {
        targetUser = await User.findOne({ email });
        // if no such user exists then throw error
        // the strings [email] and [password] are thrown with error for developer convinience ; remove exact cause in a production environment
        if (!targetUser) {
            return next(new HttpError(401, "Invalid credentials [email]"));
        }
        isPasswordValid = await bcrypt.compare(password, targetUser.password);
        //if password is wrong then throw error
        if (!isPasswordValid) {
            return next(new HttpError(401, "Invalid credentials [password]"));
        }

        // if password is valid then generate token
        token = jwt.sign({ userId: targetUser._id, username: targetUser.username, email }, process.env.JWT_KEY);

    } catch (err) {
        console.log(err);
        return next(new HttpError(500, 'Error encountered during login'))
    }

    res.status(200).json({

        userId: targetUser._id,
        username: targetUser.username,
        email,
        token
    })
}

module.exports.signupUser = async (req, res, next) => {

    let newUser, token;
    const { username, email, password } = req.body;
    try {
        // check for existing user accounts
        let existingUser;
        existingUser = await User.findOne({ username });
        if (existingUser) {
            return next(new HttpError(409, 'Username already in use'));
        }

        existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new HttpError(409, 'Email already in use'));
        }

        // create new user
        // hash password
        let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        newUser = new User({
            username, email, password: hashedPassword
        })

        await newUser.save();

        token = jwt.sign({ userId: newUser._id, username, email }, process.env.JWT_KEY);
    } catch (err) {
        console.log(err);
        return next(new HttpError(500, 'Error encountered during signup'))
    }

    res.status(201).json({
        userId: newUser._id,
        username,
        email,
        token
    })
}
