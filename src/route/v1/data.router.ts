import express from "express";
import { dataController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const dataRouter = express.Router();

/*
 * address resource
 */
dataRouter.route("/address").post(dataController.getAddress);
dataRouter.route("/location").post(dataController.getLocation);
dataRouter.route("/building").post(dataController.getBuildInfo);
dataRouter.route("/floor").post(dataController.getBuildFloorInfo);
dataRouter.route("/landprice").post(dataController.getLandPriceInfo);
dataRouter.route("/landplan").post(dataController.getLandPlanInfo);
dataRouter.route("/landplanWMS").post(dataController.getLandPlanWMSInfo);
dataRouter.route("/landspaceWMS").post(dataController.getLandSpaceWMSInfo);
dataRouter.route("/wms").post(dataController.getWMSInfo);
dataRouter.route("/wmsLegend").post(dataController.getWMSLegend);
dataRouter.route("/wmsFeature").post(dataController.getWMSFeatureInfo);
dataRouter.route("/landplanWFS").post(dataController.getLandPlanWFSInfo);
dataRouter.route("/land").post(dataController.getLandInfo);

export default dataRouter;
