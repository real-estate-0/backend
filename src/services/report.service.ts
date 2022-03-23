import { ApiError } from "../utils/ApiError";
import { ObjectID } from "bson";
import { Report } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";
import pptxgen from "pptxgenjs";
import moment from "moment";
import { convert } from "html-to-text";

const logger = createLogger("Report", "service");

const convertFormat = (value: any) => {
  if (value === "" || !value) return "";
  return moment(value).format("YYYY-MM-DD");
};

const getBcRat = (building: TBuilding | undefined) => {
  if (isNull(building?.bcRat)) {
    if (building?.archArea && building?.platArea) {
      const result = (
        parseFloat(building.archArea) / parseFloat(building.platArea)
      ).toFixed(4);
      return String(parseFloat(result) * 100);
    }
  } else {
    return String(building?.bcRat || 0);
  }
};

const getVlRat = (building: TBuilding | undefined) => {
  if (isNull(building?.vlRat)) {
    if (building?.totArea && building?.platArea) {
      const result = (
        parseFloat(building.totArea) / parseFloat(building.platArea)
      ).toFixed(4);
      return String(parseFloat(result) * 100);
    }
  } else {
    return String(building?.vlRat || 0);
  }
};

const isNull = (value: any) => {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    value === "undefined" ||
    value === 0 ||
    value === "0"
  )
    return true;
  return false;
};

const convertAreaToPy = (n: string | undefined) => {
  if (!n) return "";
  return (parseFloat(n) * 0.3025).toFixed(1) + "평";
};

const addFraction = (value: number | string | undefined) => {
  if (!value) return "";
  let result: number;
  if (typeof value === "string") result = parseFloat(value);
  else result = value;
  return result.toLocaleString();
};

const getLastPublicPrice = (price: TPublicPrice[]) => {
  if (price && price.length > 0) {
    return parseFloat(price[price.length - 1]?.pblntfPclnd || "0");
  }
  return 0;
};

class ReportService extends Service {
  constructor() {
    super();
  }

  createReport = async (reportData: IReport, userObjectId: string) => {
    logger.debug(`[start] createReport:`);
    // default value proper hard code?
    //FIX
    return await Report.create(reportData, userObjectId);
  };

  updateReport = async (
    reportObjectId: string,
    field: string,
    value: any,
    userObjectId: string
  ) => {
    console.log("will update Report", reportObjectId, field, userObjectId);
    return await Report.updateOne(
      { _id: new ObjectID(reportObjectId) },
      { $set: { [field]: value, updatedTime: new Date() } }
    );
  };

  updateReportAll = async (
    reportObjectId: string,
    value: IReport,
    userObjectId: string
  ) => {
    console.log("will update Report", reportObjectId);
    delete value["_id"];
    return await Report.updateOne(
      { _id: new ObjectID(reportObjectId) },
      { $set: { ...value, updatedTime: new Date() } }
    );
  };

  getReports = async (fields: string[]) => {
    let result = await Report.find({}, fields);
    return result.sort((a: IReport, b: IReport) => {
      return b.updatedTime.getTime() - a.updatedTime.getTime();
    });
  };

  getReportByObjectIds = async (
    reportObjectIds: string[],
    fields: string[]
  ) => {
    return await Report.findByIds(reportObjectIds, fields);
  };

  deleteReport = async (reportObjectId: string) => {
    return await Report.deleteOne({ _id: new ObjectID(reportObjectId) });
  };

  createReportAttachments = async (
    reportObjectId: string,
    files: TAttachment[]
  ) => {
    const docs = await Report.findById<IReport>(reportObjectId);
    const attachments = [...(docs.attachments || []), ...files];

    return await Report.updateOne(
      { _id: new ObjectID(reportObjectId) },
      { $set: { attachments: attachments } }
    );
  };

  deleteReportAttachment = async (reportObjectId: string, fileName: string) => {
    const report = await Report.findById<IReport>(reportObjectId);
    if (report) {
      let { attachments } = report;
      attachments = attachments.filter(
        (attachment) => attachment.fileName != fileName
      );
      return await Report.updateOne(
        { _id: new ObjectID(reportObjectId) },
        { $set: { attachments } }
      );
    }
  };
  createPPT = async (report: IReport) => {
    if (report) {
      const pptBuilder = new PPTBuilder(report);
      return pptBuilder.getPPT();
    }
    return new ApiError(400, "NOT_FOUND");
  };
}

class PPTBuilder {
  report: IReport;
  pres: any;
  COLOR_GREEN = "269a26";
  COLOR_GRAY = "919595";
  COLOR_WHITE = "ffffff";
  COLOR_BLACK = "000000";
  COLOR_LIGHT_GREEN = "c6e0b4";
  COLOR_HEAVY_GREEN = "a9d08e";
  COLOR_RED = "c80d3a";
  columnOptions = {
    fontSize: 8,
    align: "center",
    border: { pt: 1, color: this.COLOR_BLACK },
    fill: this.COLOR_WHITE,
  };

  headerOptions = {
    fontSize: 8,
    align: "center",
    border: { pt: 1, color: this.COLOR_BLACK },
    fill: this.COLOR_LIGHT_GREEN,
  };
  totalDepositResult = 0;
  totalMonthResult = 0;
  totalManagementResult = 0;

  constructor(report: IReport) {
    this.report = report;
    this.pres = new pptxgen();

    if (report?.floor) {
      for (let i = 0; i < report.floor.length; i++) {
        if (report.floor[i].deposit) {
          this.totalDepositResult += parseFloat(report.floor[i].deposit);
        }
        if (report.floor[i].month) {
          this.totalMonthResult += parseFloat(report.floor[i].month);
        }
        if (report.floor[i].management) {
          this.totalManagementResult += parseFloat(report.floor[i].management);
        }
      }
    }
  }
  renderTemplate = (slide) => {
    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "0.1%",
      y: "1%",
      w: "2%",
      h: "3.5%",
      fill: { color: this.COLOR_GREEN },
      line: { color: this.COLOR_GREEN, width: 2 },
      flipV: true,
    });
    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "54%",
      y: "1.2%",
      w: "1%",
      h: "3.5%",
      fill: { color: this.COLOR_GREEN },
      line: { color: this.COLOR_GREEN, width: 2 },
      flipH: true,
    });
    slide.addShape(this.pres.ShapeType.rect, {
      x: "55.1%",
      y: "1%",
      w: "45%",
      h: "4%",
      fill: { color: this.COLOR_GREEN },
    });
    slide.addText("(주)케이빌딩 부동산중개법인", {
      x: "77%",
      y: "3%",
      fontSize: 11,
      color: this.COLOR_WHITE,
      italic: true,
    });
    //footer
    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "69%",
      y: "95.2%",
      w: "0.7%",
      h: "3.5%",
      fill: { color: this.COLOR_GREEN },
      line: { color: this.COLOR_GREEN, width: 2 },
      flipV: true,
    });

    slide.addShape(this.pres.ShapeType.rect, {
      x: 0,
      y: "95%",
      w: "69%",
      h: "4%",
      fill: { color: this.COLOR_GREEN },
    });
    slide.addText("(주)케이빌딩 부동산중개법인", {
      x: "2%",
      y: "97%",
      fontSize: 11,
      color: this.COLOR_WHITE,
      italic: true,
    });

    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "71.3%",
      y: "95.2%",
      w: "0.7%",
      h: "3.5%",
      fill: { color: this.COLOR_GRAY },
      line: { color: this.COLOR_GRAY, width: 2 },
      flipH: true,
    });

    slide.addShape(this.pres.ShapeType.rect, {
      x: "72%",
      y: "95%",
      w: "28%",
      h: "4%",
      fill: { color: this.COLOR_GRAY },
    });

    slide.addText("Strictly Private Business Paper", {
      x: "75%",
      y: "97%",
      fontSize: 9,
      color: this.COLOR_WHITE,
      italic: true,
    });
  };

  render1 = (slide: any, address?: string) => {
    slide.addText(address, {
      x: 0.7,
      y: 1,
      fontSize: 20,
      color: this.COLOR_BLACK,
    });
    slide.addText("상 호 명 : 주식회사 케이빌딩부동산중개법인", {
      x: "63%",
      y: "65%",
      fontSize: 11,
    });
    slide.addText("소 재 지 : 서울특별시 송파구 동남로4길 27, 1층", {
      x: "63%",
      y: "70%",
      fontSize: 11,
    });
    slide.addText("등록번호 : 11710202200029", {
      x: "63%",
      y: "75%",
      fontSize: 11,
    });
    slide.addText("대표번호 : 02-449-0909", {
      x: "63%",
      y: "80%",
      fontSize: 11,
    });
  };
  render2 = (slide: any, report: IReport) => {
    //builiding image
    slide.addImage({
      data: report?.roadview?.length > 0 ? report.roadview[0] : null,
      x: 0.2,
      y: 0.4,
      w: 4.5,
      h: 4.8,
    });

    //소재지 table
    const locationRows = [];
    locationRows.push([
      {
        text: "소재지",
        options: {
          ...this.headerOptions,
          rowspan: 2,
          fill: this.COLOR_HEAVY_GREEN,
        },
      },
      {
        text: report?.location?.road?.jibunAddr || "",
        options: {
          ...this.columnOptions,
          colspan: 4,
        },
      },
    ]);
    locationRows.push([
      {
        text: "교통",
        options: this.headerOptions,
      },
      {
        text: report?.location?.transport,
        options: this.columnOptions,
      },
      {
        text: "도로",
        options: this.headerOptions,
      },
      {
        text: report?.location?.road_,
        options: this.columnOptions,
      },
    ]);

    slide.addTable(locationRows, {
      x: "49%",
      y: 0.4,
      w: 4.8,
      h: 0.2,
    });
    const landRows = [];

    landRows.push([
      {
        text: "토지",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_HEAVY_GREEN,
          rowspan: 3,
        },
      },
      {
        text: "대지면적",
        options: this.headerOptions,
      },
      {
        text: report?.building?.platArea + "㎡",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "",
        options: this.columnOptions,
      },
      {
        text: convertAreaToPy(report?.building?.platArea),
        options: {
          ...this.columnOptions,
          border: { pt: 1, color: this.COLOR_RED },
          align: "right",
        },
      },
    ]);
    landRows.push([
      {
        text: "용도지역",
        options: this.headerOptions,
      },
      {
        text: report?.location?.landUse || "",
        options: { ...this.columnOptions, colspan: 3, border: { pt: 0 } },
      },
    ]);
    landRows.push([
      {
        text: "공시지가",
        options: this.headerOptions,
      },
      {
        text: addFraction(getLastPublicPrice(report?.publicPrice || [])) + "원",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "합계",
        options: this.headerOptions,
      },
      {
        text:
          addFraction(
            (
              (getLastPublicPrice(report?.publicPrice || []) *
                parseFloat(report?.building?.platArea || "0")) /
              10000
            ).toFixed(0)
          ) + "원",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);

    slide.addTable(landRows, {
      x: "49%",
      y: 0.9,
      w: 4.8,
      h: 0.5,
    });

    const buildingRows = [];

    buildingRows.push([
      {
        text: "건물",
        options: {
          ...this.headerOptions,
          rowspan: 6,
          fill: this.COLOR_HEAVY_GREEN,
        },
      },
      {
        text: "건축면적",
        options: this.headerOptions,
      },
      {
        text: report?.building?.archArea + "㎡",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "",
        options: this.columnOptions,
      },
      {
        text: convertAreaToPy(report?.building?.archArea),
        options: {
          ...this.columnOptions,
          border: { pt: 1, color: this.COLOR_RED },
          align: "right",
        },
      },
    ]);

    buildingRows.push([
      {
        text: "연면적",
        options: this.headerOptions,
      },
      {
        text: report?.building?.totArea + "㎡",
        options: {
          ...this.columnOptions,
          border: { pt: 0 },
          align: "right",
        },
      },
      {
        text: "",
        options: this.columnOptions,
      },
      {
        text: convertAreaToPy(report?.building?.totArea),
        options: {
          ...this.columnOptions,
          border: { pt: 1, color: this.COLOR_RED },
          align: "right",
        },
      },
    ]);

    buildingRows.push([
      {
        text: "용적률 산정용 연면적",
        options: { ...this.headerOptions, fontSize: 6 },
      },
      {
        text: report.building?.vlRatEstmTotArea + "㎡",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "구조",
        options: this.headerOptions,
      },
      {
        text: report.building.strctCdNm,
        options: this.columnOptions,
      },
    ]);
    buildingRows.push([
      {
        text: "건폐율",
        options: this.headerOptions,
      },
      {
        text: parseFloat(getBcRat(report.building) || "0").toFixed(2) + "%",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "용적률",
        options: this.headerOptions,
      },
      {
        text: parseFloat(getVlRat(report.building) || "0").toFixed(2) + "%",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);

    buildingRows.push([
      {
        text: "층수",
        options: this.headerOptions,
      },
      {
        text:
          report?.building?.grndFlrCnt ||
          "" + "/" + report?.building?.ugrndFlrCnt ||
          "",
        options: this.columnOptions,
      },
      {
        text: "승강기",
        options: this.headerOptions,
      },
      {
        text: report?.building?.elvCnt,
        options: this.columnOptions,
      },
    ]);

    buildingRows.push([
      {
        text: "주차",
        options: this.headerOptions,
      },
      {
        text: report?.building?.parkingLotCnt || "",
        options: this.columnOptions,
      },
      {
        text: "준공일",
        options: this.headerOptions,
      },
      {
        text: convertFormat(report?.building?.useAprDay || ""),
        options: this.columnOptions,
      },
    ]);

    slide.addTable(buildingRows, {
      x: "49%",
      y: 1.63,
      w: 4.8,
      h: 1.4,
    });

    const priceRows = [];
    priceRows.push([
      {
        text: "금액",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_HEAVY_GREEN,
          rowspan: 3,
        },
      },
      {
        text: "보증금",
        options: this.headerOptions,
      },
      {
        text: addFraction(this.totalDepositResult) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "임대료",
        options: this.headerOptions,
      },
      {
        text: addFraction(this.totalMonthResult) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);

    priceRows.push([
      {
        text: "관리비",
        options: this.headerOptions,
      },
      {
        text: addFraction(this.totalManagementResult),
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "수익률",
        options: this.headerOptions,
      },
      {
        text: parseFloat(report?.pfper || "0").toFixed(2) + "%",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);

    priceRows.push([
      {
        text: "평단가",
        options: this.headerOptions,
      },
      {
        text: addFraction(report?.building?.pricePer || "0") + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: "매매가",
        options: this.headerOptions,
      },
      {
        text: addFraction(report?.building?.price || "0") + "억",
        options: {
          ...this.columnOptions,
          border: { pt: 1, color: this.COLOR_RED },
          align: "right",
        },
      },
    ]);

    slide.addTable(priceRows, {
      x: "49%",
      y: 3.16,
      w: 4.8,
      h: 0.7,
    });

    const html = report?.detail;
    const text = convert(html, { wordwrap: 100 });
    //extra
    slide.addTable(
      [
        [
          {
            text: text || "",
            options: {
              border: {
                pt: 1,
                color: this.COLOR_BLACK,
                fill: this.COLOR_WHITE,
              },
            },
          },
        ],
      ],
      {
        x: "49%",
        y: 3.9,
        w: 4.8,
        h: 1.29,
      }
    );
  };

  render3 = (slide, report: IReport) => {
    const rows = [];
    //rent table
    rows.push([
      {
        text: "운영수입",
        options: {
          ...this.headerOptions,
          rowspan: 9,
          //margin: [20, 0, 0, 0],
        },
      },
      { text: "층수", options: this.headerOptions },
      { text: "용도(임차구성)", options: this.headerOptions },
      { text: "임대면적", options: this.headerOptions },
      { text: "계약기간", options: this.headerOptions },
      { text: "보증금(만)", options: this.headerOptions },
      { text: "임대료(만)", options: this.headerOptions },
      { text: "관리비(만)", options: this.headerOptions },
    ]);
    /*
  *
  function resize(arr, newSize, defaultValue) {
    return [ ...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue)];
  }
  */
    const floors = report.floor || [];
    Array.from({ length: 7 }).map((item, index) => {
      console.log("number", index, index < floors.length);
      const areaText = floors[index]?.area
        ? floors[index].area + "㎡/" + convertAreaToPy(floors[index].area)
        : "";
      if (index < floors.length) {
        rows.push([
          { text: floors[index].flrNoNm, options: this.columnOptions },
          { text: floors[index].etcPurps, options: this.columnOptions },
          {
            text: areaText,
            options: { ...this.columnOptions, align: "right" },
          },
          { text: "", options: this.columnOptions },
          {
            text: addFraction(floors[index]?.deposit),
            options: { ...this.columnOptions, align: "right" },
          },
          {
            text: addFraction(floors[index]?.month),
            options: { ...this.columnOptions, align: "right" },
          },
          {
            text: addFraction(floors[index]?.management),
            options: { ...this.columnOptions, align: "right" },
          },
        ]);
      } else {
        rows.push([
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
          { text: "", options: this.columnOptions },
        ]);
      }
    });

    rows.push([
      { text: "합계", options: { ...this.headerOptions, colspan: 4 } },
      {
        text: addFraction(this.totalDepositResult) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: addFraction(this.totalMonthResult) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: addFraction(this.totalManagementResult) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    slide.addTable(rows, { x: 0.2, y: 0.4, w: 9.4 });

    //summary
    const sumRows = [];
    sumRows.push([
      {
        text: "예상 운영수입",
        options: {
          ...this.headerOptions,
          rowspan: 7,
          margin: [10, 0, 0, 0],
        },
      },
      { text: "구분", options: this.headerOptions },
      { text: "월간", options: this.headerOptions },
      { text: "연간", options: this.headerOptions },
    ]);
    sumRows.push([
      { text: "보증금", options: this.headerOptions },
      {
        text: addFraction(parseFloat(report.expect?.deposit || "0")) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: addFraction(parseFloat(report.expect?.deposit || "0")) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    sumRows.push([
      { text: "임대료", options: this.headerOptions },
      {
        text: addFraction(report.expect?.month || "0") + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: addFraction(parseFloat(report.expect?.month || "0") * 12) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    sumRows.push([
      { text: "관리비", options: this.headerOptions },
      {
        text: addFraction(report.expect?.management || "0") + "만",
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text:
          addFraction(parseFloat(report.expect?.management || "0") * 12) + "만",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    sumRows.push([
      { text: "임대료합계", options: this.headerOptions },
      {
        text: addFraction(
          parseFloat(report?.expect?.month || "0") +
            parseFloat(report?.expect?.management || "0")
        ),
        options: { ...this.columnOptions, align: "right" },
      },
      {
        text: addFraction(
          parseFloat(report?.expect?.month || "0") +
            parseFloat(report?.expect?.management || "0") * 12
        ),
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    sumRows.push([
      { text: "매매대금", options: { ...this.headerOptions, colspan: 2 } },
      { text: "", options: this.columnOptions },
      {
        text: addFraction(report?.building?.price || "") + "억",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    sumRows.push([
      { text: "예상수익률", options: { ...this.headerOptions, colspan: 2 } },
      { text: "", options: this.columnOptions },
      {
        text: (report?.expect?.expectPfPer || "") + "%",
        options: { ...this.columnOptions, align: "right" },
      },
    ]);
    slide.addTable(sumRows, {
      x: 0.2,
      y: "58%",
      w: 4.5,
      h: 2,
    });

    const html = report?.rentDetail;
    const text = convert(html, { wordwrap: 100 });
    //extra
    slide.addTable(
      [
        [
          {
            text: text,
            options: {
              border: {
                pt: 1,
                color: this.COLOR_BLACK,
                fill: this.COLOR_WHITE,
              },
            },
          },
        ],
      ],
      {
        x: "49%",
        y: "58%",
        w: 4.7,
        h: 2,
      }
    );
  };

  render4 = (slide, report: IReport) => {
    if (report?.landPlanWMS)
      slide.addImage({
        data: report.landPlanWMS,
        x: 0.2,
        y: 0.4,
        w: 7,
        h: 4.8,
      });
  };

  render7 = (slide, report: IReport) => {
    //builiding image
    const START_X1 = 0.2;
    const START_Y1 = 0.4;
    const WIDTH = 4.3;
    const HEIGHT = 2.4;
    const START_X2 = 4.7;
    const START_Y2 = 2.9;

    const X = [0.2, 4.7, 0.2, 4.7];
    const Y = [0.4, 0.4, 2.9, 2.9];

    for (let i = 0; i < report.roadview.length; i++) {
      slide.addImage({
        data: report.roadview[i],
        x: X[i],
        y: Y[i],
        w: WIDTH,
        h: HEIGHT,
      });
    }
    /*
    slide.addImage({
      path: imagePath2,
      x: START_X2,
      y: START_Y1,
      w: WIDTH,
      h: HEIGHT,
    });
    slide.addImage({
      path: imagePath3,
      x: START_X1,
      y: START_Y2,
      w: WIDTH,
      h: HEIGHT,
    });
    slide.addImage({
      path: imagePath4,
      x: START_X2,
      y: START_Y2,
      w: WIDTH,
      h: HEIGHT,
    });
    */
  };

  getPPT = () => {
    const slide1 = this.pres.addSlide();
    this.renderTemplate(slide1);
    this.render1(slide1, this.report.location.address);

    const slide2 = this.pres.addSlide();
    this.renderTemplate(slide2);
    this.render2(
      slide2,
      this.report
      //"https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
    );

    const slide3 = this.pres.addSlide();
    this.renderTemplate(slide3);
    this.render3(slide3, this.report);

    //4page empty
    const slide4 = this.pres.addSlide();
    this.renderTemplate(slide4);
    this.render4(slide4, this.report);

    //4page empty
    /*
    const slide5 = this.pres.addSlide();
    this.renderTemplate(slide5);

    //6page empty
    const slide6 = this.pres.addSlide();
    this.renderTemplate(slide6);
    */

    //7page images
    const slide7 = this.pres.addSlide();
    this.renderTemplate(slide7);
    this.render7(slide7, this.report);

    return this.pres;
  };
}

const reportService = new ReportService();
export default reportService;
