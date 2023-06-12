import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { reportService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";
import {
  BlobServiceClient,
  BaseRequestPolicy,
  AnonymousCredential,
  newPipeline,
} from "@azure/storage-blob";
import config from "config";
import searchService from "../services/search.service";
import { PdfReader } from "pdfreader";

const logger = createLogger("controller", "report.controller");
const STORAGE = config.get("storage");
//@ts-ignore
const { account, sas } = STORAGE;

console.log("azure account, sas", account, sas);
// Create a policy factory with create() method provided
class RequestIDPolicyFactory {
  // Constructor to accept parameters
  prefix = undefined;
  constructor(prefix) {
    this.prefix = prefix;
  }

  // create() method needs to create a new RequestIDPolicy object
  create(nextPolicy, options) {
    return new RequestIDPolicy(nextPolicy, options, this.prefix);
  }
}

// Create a policy by extending from BaseRequestPolicy
class RequestIDPolicy extends BaseRequestPolicy {
  prefix = undefined;
  constructor(nextPolicy, options, prefix) {
    super(nextPolicy, options);
    this.prefix = prefix;
  }

  // Customize HTTP requests and responses by overriding sendRequest
  // Parameter request is WebResource type
  async sendRequest(request) {
    // Customize client request ID header
    request.headers.set("x-ms-version", `2020-02-10`);

    // response is HttpOperationResponse type
    const response = await this._nextPolicy.sendRequest(request);

    // Modify response here if needed

    return response;
  }
}
const pipeline = newPipeline(new AnonymousCredential());
// Inject customized factory into default pipeline
pipeline.factories.unshift(new RequestIDPolicyFactory("Prefix"));

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net${sas}`,
  pipeline
);

const createContainer = async (containerName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.createIfNotExists({
      access: "blob",
    });
    console.log("create container success", containerName);
  } catch (err) {
    console.log("createContainer err", err);
  }
};

const deleteContainer = async (containerName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.deleteIfExists();
    console.log("delete container success", containerName);
  } catch (err) {
    console.log("delete Container err", err);
  }
};

const upload = async (containerName, file) => {
  try {
    console.log("upload try", containerName);
    const containerClient = await blobServiceClient.getContainerClient(
      containerName
    );
    const blobOptions = { blobHTTPHeaders: { blobContentType: file.mimetype } };
    const blobName = file.originalname;
    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(
      file.buffer,
      file.size,
      blobOptions
    );
    console.log("upload ok", uploadBlobResponse);
  } catch (err) {
    console.log("upload err", err);
  }
};

const deleteFile = async (containerName, fileName) => {
  try {
    const containerClient = await blobServiceClient.getContainerClient(
      containerName
    );
    const blobName = fileName;
    const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.deleteIfExists();
    console.log("delete ok", uploadBlobResponse);
  } catch (err) {
    console.log("deleteerr", err);
  }
};

const getBlobs = async (containerName) => {
  const result: any[] = [];
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    const blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      result.push(blob.name);
    }
    return result;
  } catch (err) {
    console.error("err:::", err);
  }
};
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

//Report controller
class ReportController extends Controller {
  createReport = catchAsync(async (req, res) => {
    //console.log("createReport", JSON.stringify(req.body));
    //TODO change to user objectid
    const report = await reportService.createReport(req.body);
    //console.log("Report", report);
    res.status(httpStatus.OK).send({ result: { report } });
  });

  /**
   * @returns {ResultForm} {result: IReport[]}
   */
  getReports = catchAsync(async (req, res) => {
    console.log("getReports", req.query);
    let fields = [];
    if (req.query.guest) {
      const reports = await reportService.getReportsByGuest(req.query.guest);
      return res.status(httpStatus.OK).send({ result: { reports } });
    }
    if (req.query.fields) {
      fields = req.query.fields.split(",");
    }
    if (req.query.search) {
      const searchString = req.query.search;
      const searchResult = await searchService.getSearch(
        "body",
        searchString,
        fields
      );
      //console.log("searchResult", searchResult);
      return res
        .status(httpStatus.OK)
        .send({ result: { reports: searchResult } });
    }
    console.log("getReports fields", fields);
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
      req.body.field,
      req.body.value,
      "6179e27324df1a74636fdc76"
    );
    res.status(httpStatus.OK).send({ result: { report: report } });
  });

  updateReportAll = catchAsync(async (req, res) => {
    const report = await reportService.updateReportAll(
      req.params.reportObjectId,
      req.body,
      "6179e27324df1a74636fdc76"
    );
    res.status(httpStatus.OK).send();
  });
  deleteReport = catchAsync(async (req, res) => {
    const result = await reportService.deleteReport(req.params.reportObjectId);
    try {
      await deleteContainer(req.params.reportObjectId);
    } catch (err) {
      console.log("deleteContainer err:", req.params.reportObjectId);
    }
    res.status(httpStatus.OK).send();
  });

  createAttachments = catchAsync(async (req, res) => {
    console.log("createAttachment", req.params.reportObjectId, req.files);
    if (req.params.reportObjectId) {
      await createContainer(req.params.reportObjectId);
      const result: any[] = [];
      for await (const file of req.files) {
        console.log("upload f", file);
        const fileText = [];
        new PdfReader().parseBuffer(file.buffer, (err, item) => {
          if (err) console.error("pdf error:", err);
          else if (!item) {
            console.warn("end of buffer");
            reportService.updateReport(
              req.params.reportObjectId,
              "body",
              fileText.join(" "),
              ""
            );
          } else if (item.text) {
            //console.log("pdf text", item.text);
            fileText.push(item.text);
          }
        });

        await upload(req.params.reportObjectId, file);
        const uploadResult = {
          fileName: file.originalname,
          url: `https://${account}.blob.core.windows.net/${req.params.reportObjectId}/${file.originalname}`,
        };
        result.push(uploadResult);
      }
      await reportService.createReportAttachments(
        req.params.reportObjectId,
        result
      );
      res.status(httpStatus.OK).send({ result: result });
    }
    res.status(httpStatus.NOT_FOUND);
  });

  deleteAttachment = catchAsync(async (req, res) => {
    console.log(
      "deleteAttachment",
      req.params.reportObjectId,
      req.params.fileName
    );
    if (req.params.reportObjectId && req.params.fileName) {
      try {
        deleteFile(req.params.reportObjectId, req.params.fileName);
      } catch (err) {
        console.log("delete attachment container err", err);
      }
      reportService.deleteReportAttachment(
        req.params.reportObjectId,
        req.params.fileName
      );
      reportService.updateReport(req.params.reportObjectId, "body", "", "");
      res.status(httpStatus.OK).send();
    }
  });

  createRentPPT = catchAsync(async (req, res) => {
    console.log("createPPT", req.params.reportObjectId);
    const reports = await reportService.getReportByObjectIds(
      [req.params.reportObjectId],
      []
    );
    if (reports.length > 0) {
      const report = reports[0];
      const pptx = await reportService.createRentPPT(report);
      //console.log("pptx", report);
      pptx.stream().then((data) => {
        console.log("ppt response");
        res.writeHead(200, {
          "Access-Control-Allow-Origin": "*",
          /*
          "Content-Disposition":
            "attachment;filename=" +
            //@ts-ignore
            encodeURIComponent(report.location.address) +
            ".pptx",
            */
          "Content-Length": data.length,
        });
        res.end(Buffer.from(data, "binary"));
      });
    }
  });

  createSalePPT = catchAsync(async (req, res) => {
    console.log("createPPT", req.params.reportObjectId);
    const reports = await reportService.getReportByObjectIds(
      [req.params.reportObjectId],
      []
    );
    if (reports.length > 0) {
      const report = reports[0];
      const pptx = await reportService.createSalePPT(report);
      //console.log("pptx", report);
      pptx.stream().then((data) => {
        console.log("ppt response");
        res.writeHead(200, {
          /*
          "Content-Disposition":
            "attachment;filename=" +
            //@ts-ignore
            encodeURIComponent(report.location.address) +
            ".pptx",
            */
          "Access-Control-Allow-Origin": "*",
          "Content-Length": data.length,
        });
        res.end(Buffer.from(data, "binary"));
      });
    }
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
