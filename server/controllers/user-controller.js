const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')


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

module.exports.getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(userId)
                }
            }, {
                '$lookup': {
                    'from': 'projects',
                    'localField': '_id',
                    'foreignField': 'author',
                    'as': 'projects'
                }
            }, {
                '$addFields': {
                    'projectCount': {
                        '$size': '$projects'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'invites',
                    'localField': '_id',
                    'foreignField': 'user',
                    'as': 'invites'
                }
            }, {
                '$addFields': {
                    'inviteCount': {
                        '$size': '$invites'
                    }
                }
            },
            {
                '$project': {
                    'projects': 0,
                    'password': 0,
                    '__v': 0,
                    'createdAt': 0,
                    'invites': 0
                }
            }
        ])

        if (user.length === 0) {
            return next(new HttpError(404, 'User not found'));
        }

        res.status(200).json(user[0]);
    } catch (err) {
        console.log(err)
        next(new HttpError(500, 'Unknown error occured'));
    }
}

module.exports.searchUsersByUsername = async (req, res, next) => {
    try {
        const {searchTerm} = req.query;
        if(!searchTerm) return res.status(200).json([]);

        const users = await User.find({ username: new RegExp(searchTerm, 'i') }).select('-password -__v').limit(6);
        res.status(200).json(users);
    } catch (err) {
        console.log(err)
        next(new HttpError(500, 'Unable to fetch users'));
    }
}