import express from "express";
import { tagController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const tagRouter = express.Router();

/*
 * tag resource
 */
tagRouter
  .route("/")
  .get(tagController.getTags)
  .post(tagController.createTag)
  .delete(tagController.deleteTag);

export default tagRouter;
