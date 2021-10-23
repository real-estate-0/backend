import Joi from "joi";
import { objectId } from "./custom.validation";

const createMail = {
  body: Joi.object().keys({
    from: Joi.string().required(),
    to: Joi.array().required(),
    subject: Joi.string().required(),
    content: Joi.string().required(),
  }),
};

const getMails = {
  query: Joi.object().keys({
    type: Joi.string().valid("to", "from"),
  }),
};

const getMail = {
  params: Joi.object().keys({
    mailObjectId: Joi.string().custom(objectId),
  }),
};

const updateMail = {
  params: Joi.object().keys({
    mailObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isRead: Joi.string(),
  }),
};

const deleteMail = {
  params: Joi.object().keys({
    userObjectId: Joi.string().custom(objectId),
    mailObjectId: Joi.string().custom(objectId),
  }),
};

export { createMail, getMails, getMail, updateMail, deleteMail };
