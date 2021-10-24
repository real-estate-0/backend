import { ObjectID } from "bson";
import Model from "./base.model";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("report", "models");

/**
 * Unique index
 * - ReportId,
 * - email
 */

class Report extends Model {
  private reportDefault: IReport = {
    createUserObjectId: null, 
    title: null,
    contents: [],
    createdTime: null,
    updatedTime: null,
  };

  constructor() {
    super("reports");
    console.log("Report Constructor");
    this.init();
  }

  /**
   * @returns {IReport} Reportif insert successed
   */
  create = async (reportData: IReport): Promise<IReport> => {
    // default value proper hard code?
    console.log("Report.model create", reportData);
    let data = { ...this.reportDefault, ...reportData };
    data.createdTime = new Date();
    data.updatedTime = new Date();
    const doc = await this.insertOne(data);
    return doc;
  };
  
}

const reportModel = new Report();
export default reportModel;
