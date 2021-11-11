import { ApiError } from "../utils/ApiError";
import { ObjectID } from "bson";
import { Report } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("Report", "service");

class ReportService extends Service {
  constructor() {
    super();
  }

  createReport = async (reportData: IReport, userObjectId: string) => {
    logger.debug(`[start] createReport: ${reportData}`);

    // default value proper hard code?
    //FIX
    return await Report.create(reportData, userObjectId);
  };

  updateReport = async (
    reportObjectId: string,
    reportInfo: IReport,
    userObjectId: string
  ) => {
    console.log("will update Report", reportObjectId);
    return await Report.updateOne(
      { _id: new ObjectID(reportObjectId) },
      { $set: { ...reportInfo } }
    );
  };

  getReports = async (fields: string[]) => {
    return await Report.find({}, fields);
  };

  getReportByObjectIds = async (reportObjectIds: string[], fields: string[]) => {
    return await Report.findByIds(reportObjectIds, fields);
  };

  deleteReport = async (reportObjectId: string) => {
    return await Report.deleteOne({ _id: new ObjectID(reportObjectId) });
  };
}

const reportService = new ReportService();
export default reportService;
