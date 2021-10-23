import Joi from "joi";
import httpStatus from "http-status";
import { pick } from "../utils/pick";
import { ApiError } from "../utils/ApiError";

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body", "files"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" } })
    .validate(object);

  if (error) {
    console.log("error", error);
    return next(new ApiError(httpStatus.BAD_REQUEST, "ME01"));
  }
  Object.assign(req, value);
  return next();
};

export default validate;
