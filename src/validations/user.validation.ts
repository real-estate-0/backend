import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({
  _id: Joi.string().required(),
  userName: Joi.string().required(),
  userId: Joi.string().required().min(3),
  password: Joi.string(),
  groupObjectIds: Joi.array().items(Joi.string().custom(objectId)),
  email: Joi.string().required(),
  roll: Joi.string(),
  verifiedEmail: Joi.boolean(),
  dept: Joi.string(),
  cellPhone: Joi.string(),
});

const createUser = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    referReportIds: Joi.array().items(Joi.string()),
    phone: Joi.string(),
    manager: Joi.string(),
    area: Joi.string(),
    etc: Joi.string(),
    address: Joi.string(),
    money: Joi.string(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    userObjectId: Joi.string(),
    role: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const getUserGroups = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      password: Joi.string(),
      role: Joi.string(),
      name: Joi.string(),
    })
    .allow(null),
};

const deleteUser = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

/*
 * Mail subresource
 */

const getUserMails = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    view: Joi.string().valid("send", "receive"),
  }),
};

const createUserMail = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    subject: Joi.string().required(),
    contents: Joi.string().required(),
    to: Joi.array(),
  }),
};

const getUserMail = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    mailObjectId: Joi.string().custom(objectId),
  }),
};

const updateUserMail = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    mailObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isRedad: Joi.boolean(),
  }),
};

const deleteUserMail = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    mailObjectId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    view: Joi.string().valid("send", "receive"),
  }),
};

export {
  schema,
  createUser,
  getUser,
  getUsers,
  getUserGroups,
  updateUser,
  deleteUser,
  getUserMails,
  createUserMail,
  getUserMail,
  updateUserMail,
  deleteUserMail,
};
