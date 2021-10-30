import Joi from "joi";
import { password, objectId } from "./custom.validation";
/*
 * config file validation
 */
const schema = Joi.object({
  _id: Joi.string().required(),
});

const createReport = {
  body: Joi.object().keys({
    title: Joi.string(),
    paragraphs: Joi.array().items(Joi.any()),
  }),
};

const getReports = {
  query: Joi.object().keys({
    _id: Joi.string(),
  }),
};

const updateReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().allow(null),
    paragraphs: Joi.array().items(Joi.any()),
  }),
};

const deleteReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
};

export { schema, createReport, getReports, updateReport, deleteReport };
