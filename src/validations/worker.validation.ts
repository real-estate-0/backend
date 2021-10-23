import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({});

const broadcastDataSchema = {
  key: Joi.string().required(),
  taskId: Joi.string().required(),
  isGlobal: Joi.boolean(),
  channel: Joi.array().items(Joi.string()),
  event: Joi.string(),
  data: Joi.object(),
};

const hookDataSchema = {
  key: Joi.string().required(),
  url: Joi.string().required(),
  method: Joi.string().required(),
  query: Joi.object(),
  body: Joi.object(),
  headers: Joi.object(),
};

export { schema, broadcastDataSchema, hookDataSchema };
