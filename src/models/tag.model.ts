import { ObjectID } from "bson";
import Model from "./base.model";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("tag", "models");

/**
 * Unique index
 * - ReportId,
 * - email
 */

class Tag extends Model {
  constructor() {
    super("settings");
    this.init();
  }

  /**
   * @returns {IReport} Reportif insert successed
   */
  create = async (tag: string): Promise<IReport> => {
    console.log("model create tag", tag);
    // default value proper hard code?
    //console.log("Report.model create", reportData);
    const doc = await this.append({ type: "tags" }, "tags", tag);
    return doc;
  };

  delete = async (tag: string): Promise<IReport> => {
    console.log("model delete tag", tag);
    // default value proper hard code?
    //console.log("Report.model create", reportData);
    const result = await this.pull({ type: "tags" }, "tags", tag);
    console.log("model delete", result);
    return result;
  };
}

const tagModel = new Tag();
export default tagModel;
