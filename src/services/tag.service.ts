import { ApiError } from "../utils/ApiError";
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

  createTag = async (tag: string, color: string) => {
    logger.debug(`[start] createTag:`);

    // default value proper hard code?
    //FIX
    return await Tag.create(tag, color);
  };

  getTags = async () => {
    return await Tag.find({ type: "tags" }, ["tags"]);
  };

  deleteTag = async (tag: string, color: string) => {
    return await Tag.delete(tag, color);
  };
}

const reportService = new TagService();
export default reportService;
