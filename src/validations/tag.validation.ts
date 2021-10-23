import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({
  _id: Joi.string().required(),
  tagName: Joi.string().required(),
  tagDescription: Joi.string().required().min(3),
  createUserId: Joi.string().custom(objectId),
  createdTime: Joi.date().required(),
  updatedTime: Joi.date().required(),
  relatedObjectId: Joi.object().keys({
    topics: Joi.array().items(Joi.string().custom(objectId)),
    groups: Joi.array().items(Joi.string().custom(objectId)),
    contents: Joi.array().items(Joi.object({ topicObjectId: Joi.string().custom(objectId), contentsObjectId: Joi.string().custom(objectId) } )),
  })
});

const getTags = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
    groupObjectId: Joi.string().custom(objectId),
  }),
};

const getTag = {
  params: Joi.object().keys({
    tagObjectId: Joi.string().custom(objectId),
  }),
};

const createTag = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
    groupObjectId: Joi.string().custom(objectId),
  }),
};

const deleteTag = {
  params: Joi.object().keys({
    topicObjectId: Joi.string().custom(objectId),
    groupObjectId: Joi.string().custom(objectId),
    tagObjectId: Joi.string().custom(objectId),
  }),
};

export { schema, getTags, getTag, createTag, deleteTag, };
