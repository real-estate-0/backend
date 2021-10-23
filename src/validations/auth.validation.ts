import Joi from "joi";
import { password } from "./custom.validation";

const register = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    termsConfirm: Joi.bool().required(),
  }),
};

const sendVerificationEmail = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

/*
 * type: id or password
 */
const sendEmailForgot = {
  body: Joi.object().keys({
    type: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export {
  register,
  sendVerificationEmail,
  verifyEmail,
  sendEmailForgot,
  login,
  logout,
};
