import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({});

const createBot = {
  body: Joi.object().keys({
    botDescription: Joi.string().required(),
    botName: Joi.string(),
  }),
  files: Joi.object().keys({
    botEngine: Joi.any(),
  }),
};

const getBots = {
  params: Joi.object().keys({}),
};

const getBot = {
  params: Joi.object().keys({
    botObjectId: Joi.string().custom(objectId),
  }),
};

const updateBot = {
  params: Joi.object().keys({
    botObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({}),
};

const deleteBot = {
  params: Joi.object().keys({
    botObjectId: Joi.string().custom(objectId),
  }),
};

const getBotIntroduce = {
  params: Joi.object().keys({
    botObjectId: Joi.string().custom(objectId),
  }),
};
const createChat = {
  body: Joi.object().keys({
    sentence: Joi.string().required(),
  }),
};

const createEvent = {
  body: Joi.object().keys({
    eventObject: Joi.object().keys({}).unknown(true),
  }),
};

export {
  schema,
  createBot,
  getBot,
  getBots,
  updateBot,
  deleteBot,
  getBotIntroduce,
  createChat,
  createEvent,
};
