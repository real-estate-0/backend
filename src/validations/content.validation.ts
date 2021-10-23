import Joi from "joi";
import { objectId } from "./custom.validation";
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

const createContents = {
  body: Joi.object().keys({
    type: Joi.string().required(),
    content: Joi.string().allow(null, ""),
    summary: Joi.string().allow(null, ""),
    createUserObjectId: Joi.string().required(),
  }),
};

export { schema, createContents };
