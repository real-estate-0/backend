import express from "express";
import { reportSchema } from "../../validations";
import { reportController } from "../../controllers";
import { auth, validate } from "../../middlewares";
import multer from "multer";
const upload = multer();

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
  .patch(validate(reportSchema.updateReport), reportController.updateReport)
  .put(validate(reportSchema.updateReportAll), reportController.updateReportAll)
  .delete(validate(reportSchema.deleteReport), reportController.deleteReport);

reportRouter.route("/:reportObjectId/attachments").post(
  //validate(reportSchema.createAttachments),
  upload.any(),
  reportController.createAttachments
);

reportRouter
  .route("/:reportObjectId/attachments/:fileName")
  .delete(
    validate(reportSchema.deleteAttachment),
    reportController.deleteAttachment
  );

export default reportRouter;
