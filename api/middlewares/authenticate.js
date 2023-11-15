const { COLLECTIONS, HTTP_STATUS_CODES, ADMIN_STATUSES, SUPPORTED_LANGUAGES, ADMIN_SECRET, ACCOUNT_STATUSES } = require('../global');
const mongoose = require('mongoose')

const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');

const errorHandler = require('../errors/errorHandler');
const AuthenticationService = require('../services/authentication.service');

let authenticate = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        errorHandler(new ResponseError("Token not provided", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
        return;
    }
    try {
        const verified = AuthenticationService.verifyToken(token);
        if (!verified) {
            errorHandler(new ResponseError("Token verification failed", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        let teacher = await DbService.getById(COLLECTIONS.TEACHERS, verified._id);
        let school = await DbService.getById(COLLECTIONS.SCHOOLS, verified._id);
        if (!teacher && !school) {
            errorHandler(new ResponseError("Account not found", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }
        if (teacher && verified.iat <= new Date(teacher.lastPasswordReset).getTime() / 1000) {
            errorHandler(new ResponseError("Token has expired", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        } else if (school && verified.iat >= new Date(school.lastPasswordReset).getTime() > 1000) {
            errorHandler(new ResponseError("Token has expired", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        req.teacher = teacher;
        req.school = school;
        req.token = token;
        next();
    }
    catch (error) {
        errorHandler(new ResponseError(error.message, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
}

module.exports = {
    authenticate
};
