import { ApiError } from "../utils/ApiError";
import { ObjectID } from "bson";
import { Tag } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("Tag", "service");

class TagService extends Service {
  constructor() {
    super();
  }

  createTag = async (tag: string) => {
    logger.debug(`[start] createTag:`);

    // default value proper hard code?
    //FIX
    return await Tag.create(tag);
  };

  getTags = async () => {
    return await Tag.find({ type: "tags" }, ["tags"]);
  };

  deleteTag = async (value) => {
    return await Tag.delete(value);
  };
}

const reportService = new TagService();
export default reportService;
