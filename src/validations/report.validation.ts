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
    title: Joi.string().allow(null),
    price: Joi.number().allow(null),
    location: Joi.object().keys({}).unknown(true).allow(null),
    building: Joi.object().keys({}).unknown(true).allow(null),
    publicPrice: Joi.array().items(Joi.any()).allow(null),
    floor: Joi.array().items(Joi.any()).allow(null),
    landPlan: Joi.array().items(Joi.any()).allow(null),
    landPlanWMS: Joi.any().allow(null),
    rent: Joi.array().items(Joi.any()).allow(null),
    tags: Joi.array().items(Joi.string()).allow(null),
    paragraphs: Joi.array().items(Joi.any()).allow(null),
  }),
};

const getReports = {
  query: Joi.object().keys({
    _id: Joi.string(),
    fields: Joi.string(),
  }),
};

const updateReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().allow(null),
    price: Joi.number(),
    information: Joi.object().keys({}).unknown(true),
    rent: Joi.array().items(Joi.any()),
    tags: Joi.array().items(Joi.string()),
    paragraphs: Joi.array().items(Joi.any()),
  }),
};

const deleteReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
};

export { schema, createReport, getReports, updateReport, deleteReport };
