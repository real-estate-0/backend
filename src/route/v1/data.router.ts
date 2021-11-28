import express from "express";
import { dataController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const addressRouter = express.Router();

/*
 * address resource
 */
addressRouter.route("/data/address").post(dataController.getAddress);
addressRouter.route("/data/building").post(dataController.getBuildInfo);

export default addressRouter;
