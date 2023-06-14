import { ApiError } from "../utils/ApiError";
import { ObjectId } from "mongodb";
import { Report } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";
import pptxgen from "pptxgenjs";
import moment from "moment";
import { convert } from "html-to-text";
import userService from "./user.service";

const logger = createLogger("Report", "service");

const convertFormat = (value: any) => {
  if (value === "" || !value) return "";
  return moment(value).format("YYYY-MM-DD");
};

const getLandPer = (report: IReport, divider: string | number) => {
  console.log("getLandPer", report.building.price, report.building.platArea);
  if (!report.building.price || !divider) return 0;
  const gArea = convertAreaToPy(String(divider) || "0", true);
  //@ts-ignore
  console.log("getLandPer", report.building.price, gArea);
  //@ts-ignore
  return (report.building.price * 10000) / gArea;
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

const convertAreaToPy = (n: string | undefined, asNum = false) => {
  if (!n) return "";
  if (asNum) {
    return (parseFloat(n) * 0.3025).toFixed(1);
  }
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

  createReport = async (reportData: IReport) => {
    logger.debug(`[start] createReport:`);
    // default value proper hard code?
    //FIX
    return await Report.create(reportData);
  };

  updateReport = async (
    reportObjectId: string,
    field: string,
    value: any,
    userObjectId: string
  ) => {
    //console.log("will update Report", reportObjectId, field, userObjectId);
    return await Report.updateOne(
      { _id: new ObjectId(reportObjectId) },
      { $set: { [field]: value, updatedTime: new Date() } }
    );
  };

  updateReportAll = async (
    reportObjectId: string,
    value: IReport,
    userObjectId: string
  ) => {
    //console.log("will update Report", reportObjectId);
    delete value["_id"];
    return await Report.updateOne(
      { _id: new ObjectId(reportObjectId) },
      { $set: { ...value, updatedTime: new Date() } }
    );
  };

  getReports = async (fields: string[]) => {
    const result = await Report.find({}, fields);
    return result.sort((a: IReport, b: IReport) => {
      return b.updatedTime.getTime() - a.updatedTime.getTime();
    });
  };

  getReportsByGuest = async (userId: string) => {
    const queryResult: any[] = await Report.find({}, ["name"]);
    const result: any[] = [];
    for (const doc of queryResult) {
      if (doc.guests) {
        for (const guest of doc.guests) {
          if (guest.userId === userId) {
            result.push(doc);
          }
        }
      }
    }
    return result;
  };

  getReportByObjectIds = async (
    reportObjectIds: string[],
    fields: string[]
  ) => {
    return await Report.findByIds(reportObjectIds, fields);
  };

  deleteReport = async (reportObjectId: string) => {
    return await Report.deleteOne({ _id: new ObjectId(reportObjectId) });
  };

  createReportAttachments = async (
    reportObjectId: string,
    files: TAttachment[]
  ) => {
    const docs = await Report.findById<IReport>(reportObjectId);
    const attachments = [...(docs.attachments || []), ...files];

    return await Report.updateOne(
      { _id: new ObjectId(reportObjectId) },
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
        { _id: new ObjectId(reportObjectId) },
        { $set: { attachments } }
      );
    }
  };
  createRentPPT = async (report: IReport) => {
    if (report) {
      const pptBuilder = await new PPTBuilder(report);
      return await pptBuilder.getRentPPT();
    }
    return new ApiError(400, "NOT_FOUND");
  };

  createSalePPT = async (report: IReport) => {
    if (report) {
      const pptBuilder = new PPTBuilder(report);
      return pptBuilder.getSalePPT();
    }
    return new ApiError(400, "NOT_FOUND");
  };
}

class PPTBuilder {
  report: IReport;
  pres: any;

  COLOR_GREEN = "269a26";
  COLOR_GRAY = "eeeeee";
  COLOR_DARK_GRAY = "a3a3a3";
  COLOR_WHITE = "ffffff";
  COLOR_BLACK = "000000";
  COLOR_LIGHT_GREEN = "c6e0b4";
  COLOR_HEAVY_GREEN = "a9d08e";
  COLOR_RED = "c00000";
  COLOR_BLUE = "d5edfc";
  COLOR_DARK_BLUE = "2e5e8b";
  ALL_BORDER = [
    {
      pt: "1",
      color: this.COLOR_DARK_GRAY,
      type: "solid",
    },
    {
      pt: "1",
      color: this.COLOR_DARK_GRAY,
      type: "solid",
    },
    {
      pt: "1",
      color: this.COLOR_DARK_GRAY,
      type: "solid",
    },
    {
      pt: "1",
      color: this.COLOR_DARK_GRAY,
      type: "solid",
    },
  ];
  columnOptions = {
    fontSize: 9,
    align: "center",
    valign: "middle",
    border: { pt: 0.5, color: this.COLOR_DARK_GRAY },
    fill: this.COLOR_WHITE,
  };

  headerOptions = {
    fontSize: 9,
    align: "center",
    valign: "middle",
    border: { pt: 0.5, color: this.COLOR_DARK_GRAY },
    fill: this.COLOR_GRAY,
  };
  totalDepositResult = 0;
  totalMonthResult = 0;
  totalManagementResult = 0;
  totalEtcResult = 0;
  constructor(report: IReport) {
    this.report = report;
    this.pres = new pptxgen();
    this.pres.layout = "LAYOUT_4x3";

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
        if (report.floor[i].etc) {
          this.totalEtcResult += parseFloat(report.floor[i].etc);
        }
      }
    }
  }
  getExpectPfper = (
    totalDeposit: number,
    totalMonth: number,
    totalManagement: number,
    price: any
  ) => {
    if (isNull(price) || price === "0" || price === 0) return "";
    const changePrice = parseFloat(price) * 10000;
    const result =
      ((totalMonth * 12 + totalManagement * 12) /
        (changePrice - totalDeposit)) *
      100;
    return result.toFixed(2);
  };

  renderTemplateSale = (slide) => {
    slide.addImage({
      path: "images/template_sale_upper1.png",
      x: 0.0,
      y: 0.1,
      w: "100%",
      h: "8%",
    });
    slide.addImage({
      path: "images/template_sale_bottom.png",
      x: 0.1,
      y: "93%",
      w: "98%",
      h: "7%",
    });
    const buildingName = this.report?.location?.road?.bdNm;
    const jibunAddr = this.report?.location?.road?.jibunAddr?.replace(
      buildingName,
      ""
    );

    console.log("renderTemplateSalePPT", buildingName, jibunAddr);
    slide.addText(buildingName + " ( " + jibunAddr + " )", {
      x: 0.1,
      y: 0.4,
      fontSize: 16,
      bold: true,
      color: this.COLOR_WHITE,
    });
    const buildingImage =
      this.report?.roadview.length > 0 ? this.report?.roadview[0] : undefined;
    console.log("buildingImage", buildingImage);

    buildingImage &&
      slide.addImage({
        data:
          this.report?.roadview?.length > 0 ? this.report.roadview[0] : null,
        x: 0.1,
        y: "11%",
        w: 2.8,
        h: 3.0,
      });

    /**개요 */
    slide.addImage({
      path: "images/icon_summary.png",
      x: 3.0,
      y: 0.85,
      w: 0.2,
      h: 0.2,
    });

    slide.addText("개요", {
      x: 3.1,
      y: 0.98,
      fontSize: 10,
    });

    //개요 위치
    const locationRows = [];
    locationRows.push([
      {
        text: "위치",
        options: {
          ...this.headerOptions,
          rowspan: 2,
        },
      },
      {
        text: "주소",
        options: {
          ...this.headerOptions,
          rowspan: 1,
        },
      },
      {
        text: jibunAddr || "",
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);
    locationRows.push([
      {
        text: "교통",
        options: this.headerOptions,
      },
      {
        text: this.report?.location?.transport,
        options: this.columnOptions,
      },
      {
        text: "도로조건",
        options: this.headerOptions,
      },
      {
        text: this.report?.location?.road_,
        options: this.columnOptions,
      },
    ]);

    slide.addTable(locationRows, {
      x: 3.0,
      y: 1.1,
      colW: [0.2, 0.7, 0.9, 0.7, 0.9],
      border: {
        pt: "1",
        color: this.COLOR_RED,
      },
    });

    const landRows = [];
    landRows.push([
      {
        text: "토지",
        options: {
          ...this.headerOptions,
          rowspan: 2,
        },
      },
      {
        text: "면적",
        options: {
          ...this.headerOptions,
          rowspan: 1,
        },
      },
      {
        text: this.report?.landInfo?.lndpclAr || "",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
      {
        text: "공시지가",
        options: {
          ...this.headerOptions,
          rowspan: 1,
        },
      },
      {
        text:
          addFraction(
            (
              getLastPublicPrice(this.report?.publicPrice || []) / 10000
            ).toFixed(0)
          ) + "만",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
    ]);
    landRows.push([
      {
        text: "용도지역",
        options: this.headerOptions,
      },
      {
        text: this.report?.location?.landUse,
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);

    slide.addTable(landRows, {
      x: 3.0,
      y: 1.7,
      colW: [0.2, 0.7, 0.9, 0.7, 0.9],
    });

    const buildingRows = [];
    buildingRows.push([
      {
        text: "건축물현황",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
          rowspan: 6,
        },
      },
      {
        text: "연면적",
        options: {
          ...this.headerOptions,
          rowspan: 1,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: convertAreaToPy(this.report?.building?.totArea),
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
      {
        text: "건폐율",
        options: {
          ...this.headerOptions,
          rowspan: 1,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text:
          parseFloat(getBcRat(this.report?.building) || "0").toFixed(2) + "%",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
    ]);
    buildingRows.push([
      {
        text: "준공년도",
        options: { ...this.headerOptions, fill: this.COLOR_BLUE },
      },
      {
        text: convertFormat(this.report?.building?.useAprDay || ""),
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
      {
        text: "용적률",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text:
          parseFloat(getVlRat(this.report.building) || "0").toFixed(2) + "%",
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);
    buildingRows.push([
      {
        text: "주구조",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: this.report?.building?.strctCdNm,
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);
    buildingRows.push([
      {
        text: "규모",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text:
          "지하 " +
          this.report?.building?.ugrndFlrCnt +
          " / 지상 " +
          this.report.building?.grndFlrCnt,
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);

    buildingRows.push([
      {
        text: "주차대수",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: "총 " +this?.report?.building?.parkingLotCnt+"대" || "",
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);

    buildingRows.push([
      {
        text: "승강기",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: (this?.report?.building?.elvCnt || "") + "대",
        options: {
          ...this.columnOptions,
          colspan: 3,
        },
      },
    ]);

    slide.addTable(buildingRows, {
      x: 3.0,
      y: 2.4,
      colW: [0.2, 0.7, 0.9, 0.7, 0.9],
    });

    const salesRows = [];
    salesRows.push([
      {
        text: "매매가",
        options: {
          ...this.headerOptions,
          rowspan: 2,
        },
      },
      {
        text: addFraction(this.report?.building?.price || "0") + "억",
        options: {
          ...this.columnOptions,
          colspan: 2,
          fontSize: 13,
          bold: true,
          color: this.COLOR_DARK_BLUE,
        },
      },
      {
        text: "수익률" || "",
        options: {
          ...this.headerOptions,
          colspan: 1,
        },
      },
      {
        text: parseFloat(this.report?.pfper || "0").toFixed(2) + "%",
        options: {
          ...this.columnOptions,
          fontSize: 13,
          bold: true,
          color: this.COLOR_DARK_BLUE,
        },
      },
    ]);
    salesRows.push([
      {
        text: "평당(토지)",
        options: this.headerOptions,
      },
      {
        text:
          addFraction(
            getLandPer(this.report, this.report.building.platArea || 0).toFixed(
              0
            ) || "0"
          ) + "만",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
      {
        text: "평당\n(연면적)",
        options: this.headerOptions,
      },
      {
        text:
          addFraction(
            getLandPer(this.report, this.report.building.totArea || 0).toFixed(
              0
            ) || "0"
          ) + "만",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
    ]);

    slide.addTable(salesRows, {
      x: 6.5,
      y: 1.1,
      colW: [0.2, 0.8, 0.8, 0.8, 0.8],
    });

    const rentRows = [];
    rentRows.push([
      {
        text: "임대",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
          rowspan: 2,
        },
      },
      {
        text: "보증금",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: addFraction(this.totalDepositResult) + "만",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
      {
        text: "월임대료" || "",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: addFraction(this.totalMonthResult) + "만",
        options: {
          ...this.columnOptions,
        },
      },
    ]);
    rentRows.push([
      {
        text: "월관리비",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: addFraction(this.totalManagementResult) + "만",
        options: {
          ...this.columnOptions,
        },
      },
      {
        text: "기타수입",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_BLUE,
        },
      },
      {
        text: addFraction(this.totalManagementResult) + "만",
        options: {
          ...this.columnOptions,
          colspan: 1,
        },
      },
    ]);

    slide.addTable(rentRows, {
      x: 6.5,
      y: 1.85,
      colW: [0.2, 0.8, 0.8, 0.8, 0.8],
    });

    const pointRows = [];
    pointRows.push([
      {
        text: "투자포인트",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
        },
      },
      {
        text: this.report?.point || "",
        options: {
          ...this.columnOptions,
          colspan: 1,
          align: "left",
          valign: "top",
        },
      },
    ]);

    slide.addTable(pointRows, {
      x: 6.5,
      y: 2.4,
      colW: [0.1, 3.2],
      h: 1.5,
    });
    //렌트상세정보
    const rentInfoRows = [];
    rentInfoRows.push([
      {
        text: "층별",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "면적(평)",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "보증금",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "임대료",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "관리비",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "용  도",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "입주사",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
      {
        text: "만기",
        options: {
          ...this.headerOptions,
          fill: this.COLOR_GRAY,
          fontSize: 7,
        },
      },
    ]);
    /**
     * Rent info
     */
    this.report.floor.map((f) => {
      rentInfoRows.push([
        {
          text: f.flrNoNm,
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.area, //면적
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.deposit, //보증금
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.month, //임대료
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.management, //관리비
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text:
            f?.etcPurps?.indexOf("(") >= 2
              ? f?.etcPurps?.slice(0, f.etcPurps.indexOf("("))
              : f?.etcPurps || "",
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.input, //입주사
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
        {
          text: f.end, //만기
          options: {
            ...this.columnOptions,
            fontSize: 6,
          },
        },
      ]);
    });

    let sumArea = 0;
    let sumDeposit = 0;
    let sumMonth = 0;
    let sumManage = 0;
    for (const f of this.report.floor) {
      sumArea += parseFloat(f.area || "0");
      sumDeposit += parseFloat(f.deposit || "0");
      sumMonth += parseFloat(f.month || "0");
      sumManage += parseFloat(f.management || "0");
    }

    console.log("Sum", sumArea, sumDeposit, sumMonth, sumManage);

    rentInfoRows.push([
      {
        text: "합계",
        options: {
          ...this.headerOptions,
          fontSize: 6,
        },
      },
      {
        text: sumArea.toFixed(1),
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: sumDeposit,
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: sumMonth,
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: sumManage,
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: "",
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: "",
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
      {
        text: "",
        options: {
          ...this.columnOptions,
          fontSize: 6,
        },
      },
    ]);

    slide.addText("임대현황", {
      x: 0,
      y: 4.1,
      fontSize: 10,
    });

    slide.addTable(rentInfoRows, {
      x: 0.1,
      y: 4.2,
      colW: [0.4, 0.6, 0.5, 0.5, 0.5, 1.1, 0.7, 0.7],
      rowH: 0.1,
    });

    //위치
    slide.addImage({
      path: "images/icon_location.png",
      x: 5.2,
      y: 4.0,
      w: 0.2,
      h: 0.2,
    });

    slide.addText("위치", {
      x: 5.3,
      y: 4.1,
      fontSize: 10,
    });
    this.report?.locImage &&
      slide.addImage({
        data: this.report?.locImage || null,
        x: 5.2,
        y: 4.2,
        w: 2.3,
        h: 2.3,
      });
    //위치
    slide.addImage({
      path: "images/icon_ji.png",
      x: 7.6,
      y: 4.0,
      w: 0.2,
      h: 0.2,
    });

    slide.addText("지적도", {
      x: 7.7,
      y: 4.1,
      fontSize: 10,
    });
    this.report?.jiImage &&
      slide.addImage({
        data: this.report?.jiImage || null,
        x: 7.6,
        y: 4.2,
        w: 2.3,
        h: 2.3,
      });
    return;
  };

  renderTemplateByIndex = async (slide, index) => {
    if (index === 1) {
      await slide.addImage({
        path: "images/template" + index + "_upper.png",
        x: "0%",
        y: "0%",
        w: "100%",
        h: "100%",
      });
      return;
    }
    await slide.addImage({
      path: "images/template" + index + "_upper.png",
      x: "2%",
      y: "2%",
      w: "96%",
      h: "10%",
    });
    await slide.addImage({
      path: "images/template_bottom.png",
      x: "2%",
      y: "88%",
      w: "96%",
      h: "10%",
    });
    if (index === 2) {
      //Rent list
      this.report &&
        this.report.floor.map(async (f, idx) => {
          await slide.addText(f.input, {
            x: 0.8,
            y: 1.4 + idx / 2,
            fontSize: 18,
            color: "242323",
          });
          await slide.addShape(this.pres.ShapeType.line, {
            line: { color: "eeeeee" },
            x: 0.7,
            y: 1.6 + idx / 2,
            w: 4,
            h: 0,
          });
        });
    }
    if (index === 3) {
      //leasing 1
      await slide.addShape(this.pres.shapes.RECTANGLE, {
        x: 0.2,
        y: 1,
        w: 0.1,
        h: 0.2,
        fill: { color: this.COLOR_RED },
        line: { type: "none" },
      });
      await slide.addText("General Information", {
        x: 0.24,
        y: 1.1,
        fontSize: 14,
        color: this.COLOR_RED,
      });
      this.report.roadview.length > 0 &&
        (await slide.addImage({
          data: this.report.roadview[0],
          x: 0.2,
          y: 1.25,
          w: 3.5,
          h: 2.5,
        }));

      const buildingInfos = [];
      buildingInfos.push([
        {
          text: "물건주소",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: this.report?.building?.platPlc || "",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "대지면적",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: (this.report.building.groundArea || "") + "㎡",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "연면적",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: (this.report.building.totArea || "") + "㎡",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "건물규모",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text:
            this.report?.building?.grndFlrCnt ||
            "" + "/" + this.report?.building?.ugrndFlrCnt ||
            "",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "주차장",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: this.report?.building?.parkingLotCnt || "",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "건축구조",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: this.report?.building?.strctCdNm || "",
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "엘리베이터",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: this.report?.building?.elvCnt,
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);
      buildingInfos.push([
        {
          text: "준공년도",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 10,
            color: this.COLOR_WHITE,
            bold: true,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
        {
          text: convertFormat(this.report.building.pmsDay || ""),
          options: {
            ...this.columnOptions,
            fontSize: 10,
            border: { pt: 1, color: this.COLOR_GRAY },
          },
        },
      ]);

      await slide.addTable(buildingInfos, {
        x: 0.2,
        y: 3.9,
        colW: [1.1, 2.4],
        border: { color: this.COLOR_GRAY },
      });

      await slide.addShape(this.pres.shapes.RECTANGLE, {
        x: 3.75,
        y: 1,
        w: 0.1,
        h: 0.2,
        fill: { color: this.COLOR_RED },
        line: { type: "none" },
      });
      await slide.addText("Location", {
        x: 3.8,
        y: 1.1,
        fontSize: 14,
        color: this.COLOR_RED,
      });
      this.report.locImage &&
        (await slide.addImage({
          data: this.report.locImage,
          x: 3.75,
          y: 1.25,
          w: 3,
          h: 2.5,
        }));

      await slide.addShape(this.pres.shapes.RECTANGLE, {
        x: 3.75,
        y: 3.9,
        w: 0.1,
        h: 0.2,
        fill: { color: this.COLOR_RED },
        line: { type: "none" },
      });

      await slide.addText("Space Availability / Rent", {
        x: 3.8,
        y: 4,
        fontSize: 14,
        color: this.COLOR_RED,
      });
      const rentInfoRows = [];
      rentInfoRows.push([
        {
          text: "층별",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
        {
          text: "면적(평)",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
        {
          text: "보증금",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
        {
          text: "임대료",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
        {
          text: "관리비",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
        {
          text: "월총비용",
          options: {
            ...this.headerOptions,
            fill: this.COLOR_RED,
            fontSize: 8,
            color: this.COLOR_WHITE,
            bold: true,
          },
        },
      ]);
      /**
       * Rent info
       */
      this.report.floor.map((f) => {
        rentInfoRows.push([
          {
            text: f.flrNoNm,
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
          {
            text: f.area, //면적
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
          {
            text: f.deposit, //보증금
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
          {
            text: f.month, //임대료
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
          {
            text: f.management, //관리비
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
          {
            text: addFraction(f.management + f.month), //월 총비용
            options: {
              ...this.columnOptions,
              fontSize: 8,
            },
          },
        ]);
      });

      rentInfoRows.push([
        {
          text: "합계",
          options: {
            ...this.headerOptions,
            bold: true,
            fontSize: 8,
          },
        },
      ]);

      await slide.addTable(rentInfoRows, {
        x: 3.75,
        y: 4.2,
        colW: [0.5, 0.6, 0.6, 0.6, 0.6, 1.2, 0.7, 0.7],
        rowH: 0.1,
      });

      await slide.addShape(this.pres.shapes.RECTANGLE, {
        x: 6.85,
        y: 1,
        w: 0.1,
        h: 0.2,
        fill: { color: this.COLOR_RED },
        line: { type: "none" },
      });
      await slide.addText("Specification", {
        x: 6.9,
        y: 1.1,
        fontSize: 14,
        color: this.COLOR_RED,
      });
      await slide.addShape(this.pres.shapes.RECTANGLE, {
        x: 6.85,
        y: 1.25,
        w: 3,
        h: 2.5,
        line: "ff0000",
        lineSize: 0.5,
      });
    }

    if (index === 4) {
      //leasing image list
      this.report &&
        this.report.roadview &&
        this.report.roadview.slice(0, 4).map(async (view, idx) => {
          console.log("roadview image", idx);
          await slide.addImage({
            data: view,
            x: idx === 0 || idx === 2 ? 0.7 : 4.8,
            y: idx === 0 || idx === 1 ? 1 : 3.85,
            w: 4,
            h: 2.7,
          });
        });
    }

    if (index == 5) {
      //명함
      await slide.addImage({
        path: "images/template_card.png",
        x: 1,
        y: 1.6,
        w: 8,
        h: 4,
      });
      if (this.report.createUserObjectId) {
        const users = (await userService.getUsers({
          _id: new ObjectId(this.report.createUserObjectId),
        })) as IUser[];
        console.log("report creatUser", users);
        if (users.length > 0) {
          console.log("addText", users[0].name);
          await slide.addText(users[0].name, {
            x: 1.3,
            y: 2.2,
            fontSize: 24,
            bold: true,
            charSpacing: 10,
            color: this.COLOR_BLACK,
          });
        }
      }
    }
  };

  renderTemplate = (slide, subheader) => {
    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "0.1%",
      y: "1%",
      w: "2%",
      h: "3.5%",
      fill: { color: this.COLOR_GREEN },
      line: { color: this.COLOR_GREEN, width: 2 },
      flipV: true,
    });

    if (subheader) {
      slide.addShape(this.pres.ShapeType.rect, {
        x: "2.4%",
        y: "2.6%",
        w: 0.06,
        h: 0.12,
        fill: { color: this.COLOR_BLUE },
        line: { color: this.COLOR_BLUE, width: 2 },
      });
      slide.addText(subheader, {
        x: "2.5%",
        y: "3.5%",
        fontSize: 10,
        bold: true,
        color: this.COLOR_BLUE,
      });
    }

    slide.addImage({
      path: "images/logo.png",
      x: "68%",
      y: "1.2%",
      w: "30%",
      h: "5%",
    });

    //footer
    slide.addShape(this.pres.ShapeType.rtTriangle, {
      x: "69%",
      y: "95.1%",
      w: "0.7%",
      h: "3.51%",
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
      y: 1.8,
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
      y: 0.5,
      w: 4.6,
      h: 6.4,
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

    /*
    slide.addTable(locationRows, {
      x: "49%",
      y: 0.5,
      w: 4.8,
      h: 0.3,
      colW: [0.8, 0.9, 1.1, 0.9, 1.1],
    });
    */
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
        options: {
          ...this.columnOptions,
          border: [
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_BLACK },
          ],
        },
      },
      {
        text: convertAreaToPy(report?.building?.platArea),
        options: {
          ...this.columnOptions,
          border: [
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_RED },
          ],
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
        options: {
          ...this.columnOptions,
          colspan: 3,
          border: { pt: 1, color: this.COLOR_BLACK },
        },
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

    /*
    slide.addTable(landRows, {
      x: "49%",
      y: 1.2,
      w: 4.8,
      h: 0.6,
      colW: [0.8, 0.9, 1.1, 0.9, 1.1],
    });
    */
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
        options: {
          ...this.columnOptions,
          border: [
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_BLACK },
          ],
        },
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
          border: { pt: 1, color: this.COLOR_BLACK },
          align: "right",
        },
      },
      {
        text: "",
        options: {
          ...this.columnOptions,
          border: [
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_BLACK },
          ],
        },
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
        options: {
          ...this.headerOptions,
          fontSize: 8,
          border: { pt: 1, color: this.COLOR_BLACK },
        },
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
        text: convertFormat(report?.building?.pmsDay || ""),
        options: this.columnOptions,
      },
    ]);

    /*
    slide.addTable(buildingRows, {
      x: "49%",
      y: 2.2,
      w: 4.8,
      h: 1.4,
      colW: [0.8, 0.9, 1.1, 0.9, 1.1],
    });
    */

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
        options: {
          ...this.columnOptions,
          align: "right",
          border: [
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_BLACK },
          ],
        },
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
        options: {
          ...this.headerOptions,
          border: [
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_RED },
            { pt: 1, color: this.COLOR_BLACK },
            { pt: 1, color: this.COLOR_BLACK },
          ],
        },
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

    /*
    slide.addTable(priceRows, {
      x: "49%",
      y: 4.1,
      w: 4.8,
      h: 0.6,
      colW: [0.8, 0.9, 1.1, 0.9, 1.1],
    });
    */
    const emptyRows = [
      [
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_RED },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
      ],
    ];
    const emptyRows2 = [
      [
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
        {
          text: "",
          options: {
            border: [
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
              { pt: 1, color: this.COLOR_BLACK },
              { pt: 0, color: this.COLOR_BLACK },
            ],
          },
        },
      ],
    ];
    const totalRows = [
      ...locationRows,
      ...emptyRows,
      ...landRows,
      ...emptyRows,
      ...buildingRows,
      ...emptyRows2,
      ...priceRows,
    ];

    slide.addTable(totalRows, {
      x: "49%",
      y: 0.5,
      w: 4.8,
      colW: [0.8, 0.9, 1.1, 0.9, 1.1],
      rowH: 0.05,
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
        y: 5.7,
        w: 4.8,
        h: 1.2,
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
          rowspan: 12,
          //margin: [20, 0, 0, 0],
        },
      },
      { text: "층수", options: this.headerOptions },
      { text: "용도\n(임차구성)", options: this.headerOptions },
      { text: "임대면적(㎡)", options: this.headerOptions },
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
    Array.from({ length: 10 }).map((item, index) => {
      //console.log("number", index, index < floors.length);
      const areaText = floors[index]?.area ? floors[index].area + "㎡" : ""; // + convertAreaToPy(floors[index].area) : "";
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
    slide.addTable(rows, {
      x: 0.2,
      y: 0.5,
      colW: [1.1, 0.7, 1.9, 1.1, 1.7, 1, 1, 1],
    });

    //summary
    const sumRows = [];
    sumRows.push([
      {
        text: "예상\n운영수입",
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
      {
        text: addFraction(report?.building?.price.toString() || "") + "억",
        options: {
          ...this.columnOptions,
          align: "right",
          color: this.COLOR_BLACK,
        },
      },
    ]);

    sumRows.push([
      { text: "예상수익률", options: { ...this.headerOptions, colspan: 2 } },
      {
        text: (addFraction(report?.expect?.expectPfPer.toString()) || "") + "%",
        options: {
          ...this.columnOptions,
          align: "right",
          color: this.COLOR_BLACK,
        },
      },
    ]);
    slide.addTable(sumRows, {
      x: 0.2,
      y: "63.5%",
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
        y: "63.5%",
        w: 4.8,
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
        w: 9.2,
        h: 6.5,
      });
  };

  render7 = (slide, report: IReport) => {
    //builiding image
    const WIDTH = 4.6;
    const HEIGHT = 3.2;

    const X = [0.2, 4.9, 0.2, 4.9];
    const Y = [0.6, 0.6, 3.7, 3.7];

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

  getSalePPT = () => {
    const slide1 = this.pres.addSlide();
    this.renderTemplateSale(slide1);
    return this.pres;
  };

  getRentPPT = async () => {
    const slide1 = await this.pres.addSlide();
    await this.renderTemplateByIndex(slide1, 1); //표지

    const slide2 = await this.pres.addSlide();
    await this.renderTemplateByIndex(slide2, 2); //Rent 목차

    const slide3 = await this.pres.addSlide();
    await this.renderTemplateByIndex(slide3, 3); //Leasing 1

    const slide4 = await this.pres.addSlide();
    await this.renderTemplateByIndex(slide4, 4); //Leasing 2

    const slide5 = await this.pres.addSlide();
    await this.renderTemplateByIndex(slide5, 5); //Contact

    /*
    this.renderTemplate(slide1, null);
    this.render1(slide1, this.report.location.address);

    const slide2 = this.pres.addSlide();
    this.renderTemplate(slide2, "물건지 정보");
    this.render2(
      slide2,
      this.report
      //"https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
    );

    const slide3 = this.pres.addSlide();
    this.renderTemplate(slide3, "렌트롤 및 예상 수익률(V.A.T 제외)");
    this.render3(slide3, this.report);

    //4page empty
    const slide4 = this.pres.addSlide();
    this.renderTemplate(slide4, "토지이용계획");
    this.render4(slide4, this.report);

    //5page empty
    const slide5 = this.pres.addSlide();
    this.renderTemplate(slide5, "지도");
      */
    //4page empty
    /*
    const slide5 = this.pres.addSlide();
    this.renderTemplate(slide5);

    //6page empty
    const slide6 = this.pres.addSlide();
    this.renderTemplate(slide6);
    */

    //7page images
    //const slide7 = this.pres.addSlide();
    //this.renderTemplate(slide7, "현장사진");
    //this.render7(slide7, this.report);

    return this.pres;
  };
}

const reportService = new ReportService();
export default reportService;
