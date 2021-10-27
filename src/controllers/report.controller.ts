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
    const report = await reportService.createReport(req.body, req.user.userObjectId);
    console.log("Report", report);
    res.status(httpStatus.OK).send({ result: { report: report } });
  });

  /**
   * @returns {ResultForm} {result: IReport[]}
   */
  getReports = catchAsync(async (req, res) => {
    console.log("getReports", req.query);
    if(req.query._id){
      const ids = req.query._id.split(",");
      const reports = await reportService.getReportByObjectIds(ids);
      res.status(httpStatus.OK).send({ result: { reports: reports } });
      return;
    }
    const reports = await reportService.getReports();
    res.status(httpStatus.OK).send({ result: { reports: reports } });
  });

  updateReport = catchAsync(async (req, res) => {
    const report = await reportService.updateReport(
      req.params.reportObjectId,
      req.body,
      req.user.userObjectId
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
