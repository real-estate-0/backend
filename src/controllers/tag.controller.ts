import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { tagService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "tag.controller");

class TagController extends Controller {
  createTag = catchAsync(async (req, res) => {
    //console.log("createTag", JSON.stringify(req.body));
    //TODO change to user objectid
    const tag = await tagService.createTag(req.body.value);
    //console.log("Tag", tag);
    res.status(httpStatus.OK).send({ result: tag });
  });

  /**
   * @returns {ResultForm} {result: ITag[]}
   */
  getTags = catchAsync(async (req, res) => {
    console.log("getTags", req.query);
    let fields = [];
    const tags = await tagService.getTags();
    //console.log("getTags result", tags);
    res.status(httpStatus.OK).send({ result: tags });
  });

  deleteTag = catchAsync(async (req, res) => {
    console.log("deleteTag", req.body);
    const result = await tagService.deleteTag(req.body.value);
    console.log("delete tag result", result);
    res.status(httpStatus.OK).send();
  });
}

const tagController = new TagController();

export default tagController;
/*
export {
  getTag,
  getTags,
  //updateTag,
  //deleteTag,
  getTagMemos,
  getTagMemo,
  createTagMemo,
  updateTagMemo,
  deleteTagMemo,
};
*/
