import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({
  _id: Joi.string().required(),
  groupName: Joi.string().required(),
  groupDescription: Joi.string().required(),
  password: Joi.string(),
  managers: Joi.array().items(Joi.string().custom(objectId)),
  members: Joi.array().items(Joi.string().custom(objectId)),
  tags: Joi.array().required(),
  createUserObjectId: Joi.string().required(),
  createdTime: Joi.date().required(),
  updatedTime: Joi.date().required(),
  topics: Joi.array().required(),
});

const createGroup = {
  body: Joi.object().keys({
    groupName: Joi.string().required(),
    groupDescription: Joi.string().required(),
  }),
};

const getGroups = {
  params: Joi.object().keys({
    _id: Joi.string(),
    memberObjectId: Joi.string()
  })
};

/*
const getGroup = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
};
*/

const updateGroup = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    groupDescription: Joi.string(),
    groupName: Joi.string(),
  }),
};

const getJoinRequests = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
};

const createJoinRequest = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const updateJoinRequest = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
    approval: Joi.boolean().required(),
  }),
};

const deleteJoinRequest = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const createGroupManager = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};
const getGroupManagers = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
};

const deleteGroupManager = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

/**
 * Group Member resource
 */
const createGroupMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const getGroupMembers = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
};
const deleteGroupMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

/**
 * Group Topic resource
 */
const createGroupTopic = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    topicName: Joi.string().required(),
    groupObjectId: Joi.string().required(),
    topicDescription: Joi.string().required(),
    password: Joi.string(),
  }),
};

const getGroupTopics = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
  }),
};

const getGroupTopic = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
};

const deleteGroupTopic = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
};

const updateGroupTopic = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    topicName: Joi.string(),
    topicDescription: Joi.string(),
  }),
};

const createGroupTopicMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
  }),
};

const deleteGroupTopicMember = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    userObjectId: Joi.string().custom(objectId),
  }),
};

const createGroupTopicManager = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const deleteGroupTopicManager = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    userObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userObjectId: Joi.string().required(),
  }),
};

const createGroupTopicContent = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().valid("html", "text", "md"),
    content: Joi.string().required(),
    summary: Joi.string().required(),
    tags: Joi.array(),
    rich: Joi.array(),
  }),
};

const getGroupTopicContents = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
  }),
};

const getGroupTopicContent = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    contentObjectId: Joi.string().custom(objectId),
  }),
};

const updateGroupTopicContent = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    contentObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({}),
};

const deleteGroupTopicContent = {
  params: Joi.object().keys({
    groupObjectId: Joi.string().custom(objectId),
    topicObjectId: Joi.string().custom(objectId),
    contentObjectId: Joi.string().custom(objectId),
  }),
};

export {
  schema,
  createGroup,
  getGroups,
//  getGroup,
  updateGroup,
  createGroupManager,
  getGroupManagers,
  deleteGroupManager,
  createGroupMember,
  getGroupMembers,
  deleteGroupMember,
  createGroupTopic,
  getGroupTopics,
  getGroupTopic,
  deleteGroupTopic,
  updateGroupTopic,
  getJoinRequests,
  createJoinRequest,
  updateJoinRequest,
  deleteJoinRequest,
  createGroupTopicMember,
  deleteGroupTopicMember,
  createGroupTopicManager,
  deleteGroupTopicManager,
  createGroupTopicContent,
  getGroupTopicContent,
  getGroupTopicContents,
  updateGroupTopicContent,
  deleteGroupTopicContent,
};
