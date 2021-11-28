import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { reportService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";
import axios from "axios";
import { URLSearchParams } from "url";
const logger = createLogger("controller", "report.controller");

class DataController extends Controller {
  /**
   * @returns {ResultForm} {result: IReport[]}
   */
  JUSO_FIELD = {
    roadAddr: "도로명주소",
    roadAddrPart1: "도로명주소(참고항목 제외)",
    roadAddrPart2: "도로명주소 참고항목",
    jibunAddr: "지번주소",
    engAddr: "도로명주소(영문)",
    zipNo: "우편번호",
    admCd: "행정구역코드",
    rnMgtSn: "도로명코드",
    bdMgtSn: "건물관리번호",
    detBdNmList: "상세건물명",
    bdNm: "건물명",
    bdKdcd: "공동주택여부(1 : 공동주택, 0 : 비공동주택)",
    siNm: "시도명",
    sggNm: "시군구명",
    emdNm: "읍면동명",
    liNm: "법정리명",
    rn: "도로명",
    udrtYn: "지하여부(0 : 지상, 1 : 지하)",
    buldMnnm: "건물본번",
    buldSlno: "건물부번",
    mtYn: "산여부(0 : 대지, 1 : 산)",
    lnbrMnnm: "지번본번(번지)",
    lnbrSlno: "지번부번(호)",
    emdNo: "읍면동일련번호",
  };

  BUILD_FIELD = {
    mainPurpsCdNm: "주용도코드명",
    etcPurps: "기타용도",
    roofCd: "지붕코드",
    roofCdNm: "지붕코드명",
    etcRoof: "기타지붕",
    hhldCnt: "세대수(세대)",
    fmlyCnt: "가구수(가구)",
    heit: "높이(m)",
    grndFlrCnt: "지상층수",
    ugrndFlrCnt: "지하층수",
    rideUseElvtCnt: "승용승강기수",
    emgenUseElvtCnt: "비상용승강기수",
    atchBldCnt: "부속건축물수",
    atchBldArea: "부속건축물면적(㎡)",
    totDongTotArea: "총동연면적(㎡)",
    indrMechUtcnt: "옥내기계식대수(대)",
    indrMechArea: "옥내기계식면적(㎡)",
    oudrMechUtcnt: "옥외기계식대수(대)",
    oudrMechArea: "옥외기계식면적(㎡)",
    indrAutoUtcnt: "옥내자주식대수(대)",
    indrAutoArea: "옥내자주식면적(㎡)",
    oudrAutoUtcnt: "옥외자주식대수(대)",
    oudrAutoArea: "옥외자주식면적(㎡)",
    pmsDay: "허가일",
    stcnsDay: "착공일",
    useAprDay: "사용승인일",
    pmsnoYear: "허가번호년",
    pmsnoKikCd: "허가번호기관코드",
    pmsnoKikCdNm: "허가번호기관코드명",
    pmsnoGbCd: "허가번호구분코드",
    pmsnoGbCdNm: "허가번호구분코드명",
    hoCnt: "호수(호)",
    engrGrade: "에너지효율등급",
    engrRat: "에너지절감율",
    engrEpi: "EPI점수",
    gnBldGrade: "친환경건축물등급",
    gnBldCert: "친환경건축물인증점수",
    itgBldGrade: "지능형건축물등급",
    itgBldCert: "지능형건축물인증점수",
    crtnDay: "생성일자",
    rnum: "순번",
    platPlc: "대지위치",
    sigunguCd: "행정표준코드",
    bjdongCd: "행정표준코드",
    platGbCd: "(0:대지 1:산 2:블록)",
    bun: "번",
    ji: "지",
    mgmBldrgstPk: "관리건축물대장PK",
    regstrGbCd: "대장구분코드",
    regstrGbCdNm: "대장구분코드명",
    regstrKindCd: "대장종류코드",
    regstrKindCdNm: "대장종류코드명",
    newPlatPlc: "도로명대지위치",
    bldNm: "건물명",
    splotNm: "특수지명",
    block: "블록",
    lot: "로트",
    bylotCnt: "외필지수",
    naRoadCd: "새주소도로코드",
    naBjdongCd: "새주소법정동코드",
    naUgrndCd: "새주소지상지하코드",
    naMainBun: "새주소본번",
    naSubBun: "새주소부번",
    dongNm: "동명칭",
    mainAtchGbCd: "주부속구분코드",
    mainAtchGbCdNm: "주부속구분코드명",
    platArea: "대지면적(㎡)",
    archArea: "건축면적(㎡)",
    bcRat: "건폐율(%)",
    totArea: "연면적(㎡)",
    vlRatEstmTotArea: "용적률산정연면적(㎡)",
    vlRat: "용적률(%)",
    strctCd: "구조코드",
    strctCdNm: "구조코드명",
    etcStrct: "기타구조",
    mainPurpsCd: "주용도코드",
    rserthqkDsgnApplyYn: "내진 설계 적용 여부",
    rserthqkAblty: "내진 능력",
  };

  PRICE_FIELD = {
    pnu: "고유번호",
    ldCode: "법정동코드",
    ldCodeNm: "법정동명",
    regstrSeCode: "특수지구분코드",
    regstrSeCodeNm: "특수지구분명",
    mnnmSlno: "지번",
    stdrYear: "기준년도",
    stdrMt: "기준월",
    pblntfPclnd: "공시지가(원/㎡)",
    pblntfDe: "공시일자",
    stdLandAt: "표준지여부",
    lastUpdtDt: "데이터기준일자",
  };

  getAddress = catchAsync(async (req, res) => {
    if (req.body.address) {
      const key = "devU01TX0FVVEgyMDIxMTEyNTIxMDc1MjExMTk1NDI=";
      console.log(
        "getAddress",
        req.body.address,
        encodeURIComponent(req.body.address)
      );
      const address = await axios.post(
        "https://www.juso.go.kr/addrlink/addrLinkApi.do",
        {
          confmKey: key,
          currentPage: 1,
          countPerPage: 100,
          keyword: encodeURIComponent(req.body.address),
          resultType: "json",
        }
      );
      console.log("getAddress", address.data);
      return res
        .status(httpStatus.OK)
        .send({ result: { address, fields: this.JUSO_FIELD } });
    }
  });

  getBuildInfo = catchAsync(async (req, res) => {
    if (
      req.body.sigunguCd &&
      req.body.bjdongCd &&
      req.body.bun &&
      req.body.ji
    ) {
      const KEY =
        "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
      const URL =
        "http://apis.data.go.kr/1613000/BldRgstService_v2/getBrTitleInfo";
      const building = axios.get(URL, {
        params: new URLSearchParams({
          serviceKey: KEY,
          sigunguCd: req.body.sigunguCd,
          bjdongCd: req.body.bjdongCd,
          bun: req.body.bun, //4자리 00패딩
          ji: req.body.ji, //4자리 00패딩
        }),
        headers: {
          Accept: "*",
        },
      });
      return res
        .status(httpStatus.OK)
        .send({ result: { building, fields: this.BUILD_FIELD } });
    }
  });

  getLandPrice = catchAsync(async (req, res) => {
    if (req.body.pnu && req.body.stdrYear) {
      const KEY =
        "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
      const URL =
        "http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr";
      const price = axios.get(URL, {
        params: new URLSearchParams({
          serviceKey: KEY,
          pnu: req.body.pnu,
          stdrYear: req.body.stdrYear,
          format: "json",
          numOfRows: "10",
          pageNoe: "1",
        }),
        headers: {
          Accept: "*",
        },
      });
      return res
        .status(httpStatus.OK)
        .send({ result: { price, fields: this.PRICE_FIELD } });
    }
  });
}

const dataController = new DataController();

export default dataController;
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
