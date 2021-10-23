import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({
  _id: Joi.string(),
  topicName: Joi.string(),
  topicDescription: Joi.string(),
  password: Joi.string(),
  members: Joi.array(),
  managers: Joi.array(),
  groupObjectId: Joi.string().custom(objectId),
  tags: Joi.array(),
  createUserObjectId: Joi.string(),
  createdTime: Joi.date(),
  updatedTime: Joi.date(),
});

const createTopic = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    topicName: Joi.string().required(),
    topicDescription: Joi.string().required(),
    groupObjectId: Joi.string().required(),
    password: Joi.string().allow(null, ""),
  }),
};

const getTopics = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const getTopic = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
  }),
};

const updateTopic = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    topicName: Joi.string(),
    topicDescription: Joi.string(),
    password: Joi.string(),
  }),
};

/**
 * Topic Manager resource
 */

const createManager = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};
const getManagers = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
  }),
};

const deleteManager = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const createMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const deleteMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    userObjectId: Joi.string().custom(objectId),
  }),
};

export {
  schema,
  createTopic,
  getTopics,
  getTopic,
  updateTopic,
  createManager,
  getManagers,
  deleteManager,
  createMember,
  deleteMember,
};
