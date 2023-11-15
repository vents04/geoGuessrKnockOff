const express = require('express');
const mongoose = require('mongoose');
const { userSignupValidation, userLoginValidation } = require('../validation/hapi');
const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const User = require('../db/models/user.model');
const AuthenticationService = require('../services/authentication.service');
const DbService = require('../services/db.service');
const router = express.Router();

router.post('/signup', async (req, res, next) => {
    const { error } = userSignupValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    req.body.email = req.body.email.toLowerCase();

    try {
        const existingUser = await DbService.getMany(COLLECTIONS.USERS, { email: req.body.email });
        if (existingUser.length > 0) {
            return next(new ResponseError("There is an existing user with this email", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const user = new User(req.body);
        user.password = AuthenticationService.hashPassword(user.password);

        await DbService.create(COLLECTIONS.USERS, user);

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: new mongoose.Types.ObjectId(school._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token,
                user
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/login', async (req, res, next) => {
    const { error } = userLoginValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    req.body.email = req.body.email.toLowerCase();

    try {
        const existingUser = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!existingUser) {
            return next(new ResponseError("Invalid user account login", HTTP_STATUS_CODES.CONFLICT));
        }

        const isPasswordValid = AuthenticationService.verifyPassword(req.body.password, existingUser.password);
        if (!isPasswordValid) return next(new ResponseError("Invalid user account login", HTTP_STATUS_CODES.BAD_REQUEST, 58));

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: new mongoose.Types.ObjectId(existingSchool._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token,
                user: existingUser
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;