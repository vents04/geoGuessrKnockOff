const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const userSignupValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
}

const userLoginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
}

module.exports = {
    userSignupValidation,
    userLoginValidation
}
