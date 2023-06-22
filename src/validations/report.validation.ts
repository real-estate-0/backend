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
    createUserObjectId: Joi.string().allow(null, ""),
    title: Joi.string().allow(null, ""),
    location: Joi.object().keys({}).unknown(true).allow(null, ""),
    landInfo: Joi.object().keys({}).unknown(true).allow(null, ""),
    building: Joi.object().keys({}).unknown(true).allow(null, ""),
    publicPrice: Joi.array().items(Joi.any()).allow(null, ""),
    floor: Joi.array().items(Joi.any()).allow(null, ""),
    landPlan: Joi.array().items(Joi.any()).allow(null, ""),
    landPlanWMS: Joi.any().allow(null, ""),
    map: Joi.string().allow(null, ""),
    roadview: Joi.array().items(Joi.string()).allow(null, ""),
    pfper: Joi.string().allow(null, ""),
  }),
};
const createPDF = {
  body: Joi.object().keys({
    data: Joi.any(),
  }),
};

const getReports = {
  query: Joi.object().keys({
    _id: Joi.string(),
    fields: Joi.string(),
    search: Joi.string().allow(null, ""),
    guest: Joi.string().allow(null),
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

const updateReportAll = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.any(),
};

const deleteReport = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
};

const createAttachments = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
  body: Joi.any(),
};

const deleteAttachment = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
    fileName: Joi.string(),
  }),
};

const createPPT = {
  params: Joi.object().keys({
    reportObjectId: Joi.string().custom(objectId),
  }),
};

export {
  schema,
  createReport,
  createPDF,
  getReports,
  updateReport,
  updateReportAll,
  deleteReport,
  createAttachments,
  deleteAttachment,
  createPPT,
};
