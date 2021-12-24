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
    location: Joi.object().keys({}).unknown(true).allow(null),
    building: Joi.object().keys({}).unknown(true).allow(null),
    publicPrice: Joi.array().items(Joi.any()).allow(null),
    floor: Joi.array().items(Joi.any()).allow(null),
    landPlan: Joi.array().items(Joi.any()).allow(null),
    landPlanWMS: Joi.any().allow(null),
    map: Joi.string().allow(null),
    roadview: Joi.array().items(Joi.string()).allow(null),
    pfper: Joi.string().allow(null, ""),
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
    field: Joi.string(),
    value: Joi.any(),
  }),
};

const deleteReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
};

export { schema, createReport, getReports, updateReport, deleteReport };
