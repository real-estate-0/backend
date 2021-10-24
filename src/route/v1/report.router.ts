import express from "express";
import { reportSchema } from "../../validations";
import { reportController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const reportRouter = express.Router();

/*
 * report resource
 */
reportRouter
  .route("/")
  .get(validate(reportSchema.getReports), reportController.getReports)
  .post(validate(reportSchema.createReport), reportController.createReport);

reportRouter
  .route("/:reportObjectId")
  .put(validate(reportSchema.updateReport), reportController.updateReport)
  .delete(validate(reportSchema.deleteReport), reportController.deleteReport);

export default reportRouter;
