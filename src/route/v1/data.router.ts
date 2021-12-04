import express from "express";
import { dataController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const addressRouter = express.Router();

/*
 * address resource
 */
addressRouter.route("/address").post(dataController.getAddress);
addressRouter.route("/location").post(dataController.getLocation);
addressRouter.route("/building").post(dataController.getBuildInfo);
addressRouter.route("/floor").post(dataController.getBuildFloorInfo);
addressRouter.route("/landprice").post(dataController.getLandPriceInfo);
addressRouter.route("/landplan").post(dataController.getLandPlanInfo);
addressRouter.route("/landplanWMS").post(dataController.getLandPlanWMSInfo);

export default addressRouter;