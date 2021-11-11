import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { reportService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "report.controller");

class ReportController extends Controller {

  createReport = catchAsync(async (req, res) => {
    console.log("createReport", JSON.stringify(req.body));
    //TODO change to user objectid
    const report = await reportService.createReport(req.body, "6179e27324df1a74636fdc76");
    //console.log("Report", report);
    res.status(httpStatus.OK).send({ result: { report } });
  });

  /**
   * @returns {ResultForm} {result: IReport[]}
   */
  getReports = catchAsync(async (req, res) => {
    console.log("getReports", req.query);
    let fields = []
    if (req.query.fields){
      fields = req.query.fields.split(",") 
    }
    console.log('getReports fields', fields)
    if (req.query._id) {
      const ids = req.query._id.split(",");
      
      const reports = await reportService.getReportByObjectIds(ids, fields);
      res.status(httpStatus.OK).send({ result: { reports } });
      return;
    }
    const reports = await reportService.getReports(fields);
    //console.log("getReports result", reports);
    res.status(httpStatus.OK).send({ result: { reports } });
  });

  updateReport = catchAsync(async (req, res) => {
    const report = await reportService.updateReport(
      req.params.reportObjectId,
      req.body,
      "6179e27324df1a74636fdc76"
    );
    res.status(httpStatus.OK).send({ result: { report: report } });
  });

  deleteReport = catchAsync(async (req, res) => {
    const result = await reportService.deleteReport(req.params.reportObjectId);
    res.status(httpStatus.OK).send();
  });
}

const reportController = new ReportController();

export default reportController;
/*
export {
  getReport,
  getReports,
  //updateReport,
  //deleteReport,
  getReportMemos,
  getReportMemo,
  createReportMemo,
  updateReportMemo,
  deleteReportMemo,
};
*/
