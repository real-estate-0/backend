import { ApiError } from "../utils/ApiError";
import { Report } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";
import pptxgen from "pptxgenjs";
import moment from "moment";
import { convert } from "html-to-text";

const logger = createLogger("Report", "service");

class SearchService extends Service {
  constructor() {
    super();
  }

  getSearch = async (field: string, value: string, projection: string[]) => {
    console.log("getSerach", value);
    const regex = new RegExp(value, "ig");
    const result = await Report.find(
      { [field]: { $regex: regex } },
      projection
    );
    //console.log("result", result);
    return result.sort((a: IReport, b: IReport) => {
      return b.updatedTime.getTime() - a.updatedTime.getTime();
    });
  };
}

const searchService = new SearchService();

export default searchService;
