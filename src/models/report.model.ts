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
    updateUserObjectId: null,
    title: null,
    price: 0,
    information: {},
    rent: [],
    tags: [], 
    paragraphs: [],
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
  create = async (
    reportData: IReport,
    userObjectId: string
  ): Promise<IReport> => {
    // default value proper hard code?
    //console.log("Report.model create", reportData);
    let data = { ...this.reportDefault, ...reportData };
    data.createdTime = new Date();
    data.updatedTime = new Date();
    data.createUserObjectId = userObjectId;
    data.updateUserObjectId = userObjectId;
    const doc = await this.insertOne(data);
    return doc;
  };
}

const reportModel = new Report();
export default reportModel;
