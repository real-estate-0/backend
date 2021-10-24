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
    ReportId: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  }),
};

const getReports = {
  query: Joi.object().keys({
    ReportObjectId: Joi.string(),
  }),
};

const updateReport = {
  params: Joi.object().keys({
    ReportObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    password: Joi.string(),
    roll: Joi.string(),
    name: Joi.string(),
  }),
};

const deleteReport = {
  params: Joi.object().keys({
    ReportObjectId: Joi.string().custom(objectId),
  }),
};

export {
  schema,
  createReport,
  getReports,
  updateReport,
  deleteReport,
};
