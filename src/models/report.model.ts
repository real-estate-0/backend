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
    createUserObjectId: "",
    updateUserObjectId: "",
    title: "",
    building: {},
    landPlan: [],
    landPlanWMS: "",
    publicPrice: [],
    detail: "",
    tags: [],
    paragraphs: [],
    createdTime: null,
    updatedTime: null,
    map: "",
    roadview: "",
    pfper: "",
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
