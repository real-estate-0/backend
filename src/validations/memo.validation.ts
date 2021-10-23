import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object().keys({
  _id: Joi.string().required(),
  type: Joi.string().required(),
  content: Joi.string().required(),
  summary: Joi.string(),
  tags: Joi.array(),
  attachment: Joi.array(),
  createUserObjectId: Joi.string().required(),
  createdTime: Joi.date().required(),
  updatedTime: Joi.date().required(),
});

const createUserMemo = {
  body: Joi.object().keys({
    type: Joi.string().required(),
    content: Joi.string().allow(null, ""),
    summary: Joi.string().allow(null, ""),
    createUserObjectId: Joi.string().required(),
  }),
};

const getUserMemo = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    memoObjectId: Joi.string().custom(objectId),
  }),
};

const getUserMemos = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const updateUserMemo = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    memoObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
    summary: Joi.string(),
  }),
};

const deleteUserMemo = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    memoObjectId: Joi.string().custom(objectId),
  }),
};
export {
  schema,
  createUserMemo,
  getUserMemo,
  getUserMemos,
  updateUserMemo,
  deleteUserMemo,
};
