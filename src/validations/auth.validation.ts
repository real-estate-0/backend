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
  login,
  logout,
};
