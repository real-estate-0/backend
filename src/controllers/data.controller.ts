import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { reportService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";
import axios from "axios";
import { URLSearchParams } from "url";
import { DOMParser } from "xmldom";
import { address } from "faker";
import fs from "fs";
import proj4 from "proj4";
import sharp from "sharp";
const logger = createLogger("controller", "report.controller");

export function parseXml(xml: any) {
  let dom = null;
  if (DOMParser) {
    try {
      dom = new DOMParser().parseFromString(xml, "text/xml");
    } catch (e) {
      dom = null;
    }
  } else alert("cannot parse xml string!");
  /*
  else if (window.ActiveXObject) {
     try {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) // parse error ..

           window.alert(dom.parseError.reason + dom.parseError.srcText);
     } 
     catch (e) { dom = null; }
  }
  */
  return dom;
}

// Changes XML to JSON
export function xml2json(xml: any, tab: any) {
  var X = {
    toObj: function (xml: any) {
      var o: any = {};
      if (xml.nodeType == 1) {
        // element node ..
        if (xml.attributes.length)
          // element with attributes  ..
          for (var i = 0; i < xml.attributes.length; i++)
            o["@" + xml.attributes[i].nodeName] = (
              xml.attributes[i].nodeValue || ""
            ).toString();
        if (xml.firstChild) {
          // element has child nodes ..
          var textChild = 0,
            cdataChild = 0,
            hasElementChild = false;
          for (var n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType == 1) hasElementChild = true;
            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/))
              textChild++;
            // non-whitespace text
            else if (n.nodeType == 4) cdataChild++; // cdata section node
          }
          if (hasElementChild) {
            if (textChild < 2 && cdataChild < 2) {
              // structured element with evtl. a single text or/and cdata node ..
              X.removeWhite(xml);
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                if (n.nodeType == 3)
                  // text node
                  o["#text"] = X.escape(n.nodeValue);
                else if (n.nodeType == 4)
                  // cdata node
                  o["#cdata"] = X.escape(n.nodeValue);
                else if (o[n.nodeName]) {
                  // multiple occurence of element ..
                  if (o[n.nodeName] instanceof Array)
                    o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                  else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                } // first occurence of element..
                else o[n.nodeName] = X.toObj(n);
              }
            } else {
              // mixed content
              if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
              else o["#text"] = X.escape(X.innerXml(xml));
            }
          } else if (textChild) {
            // pure text
            if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
            else o["#text"] = X.escape(X.innerXml(xml));
          } else if (cdataChild) {
            // cdata
            if (cdataChild > 1) o = X.escape(X.innerXml(xml));
            else
              for (var n = xml.firstChild; n; n = n.nextSibling)
                o["#cdata"] = X.escape(n.nodeValue);
          }
        }
        if (!xml.attributes.length && !xml.firstChild) o = null;
      } else if (xml.nodeType == 9) {
        // document.node
        o = X.toObj(xml.documentElement);
      } else alert("unhandled node type: " + xml.nodeType);
      return o;
    },
    toJson: function (o: any, name: any, ind: any) {
      var json = name ? '"' + name + '"' : "";
      if (o instanceof Array) {
        for (var i = 0, n = o.length; i < n; i++)
          o[i] = X.toJson(o[i], "", ind + "\t");
        json +=
          (name ? ":[" : "[") +
          (o.length > 1
            ? "\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind
            : o.join("")) +
          "]";
      } else if (o == null) json += (name && ":") + "null";
      else if (typeof o == "object") {
        var arr = [];
        for (var m in o) arr[arr.length] = X.toJson(o[m], m, ind + "\t");
        json +=
          (name ? ":{" : "{") +
          (arr.length > 1
            ? "\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind
            : arr.join("")) +
          "}";
      } else if (typeof o == "string")
        json += (name && ":") + '"' + o.toString() + '"';
      else json += (name && ":") + o.toString();
      return json;
    },
    innerXml: function (node: any) {
      var s = "";
      if ("innerHTML" in node) s = node.innerHTML;
      else {
        var asXml = function (n: any) {
          var s = "";
          if (n.nodeType == 1) {
            s += "<" + n.nodeName;
            for (var i = 0; i < n.attributes.length; i++)
              s +=
                " " +
                n.attributes[i].nodeName +
                '="' +
                (n.attributes[i].nodeValue || "").toString() +
                '"';
            if (n.firstChild) {
              s += ">";
              for (var c = n.firstChild; c; c = c.nextSibling) s += asXml(c);
              s += "</" + n.nodeName + ">";
            } else s += "/>";
          } else if (n.nodeType == 3) s += n.nodeValue;
          else if (n.nodeType == 4) s += "<![CDATA[" + n.nodeValue + "]]>";
          return s;
        };
        for (var c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
      }
      return s;
    },
    escape: function (txt: any) {
      return txt
        .replace(/[\\]/g, "\\\\")
        .replace(/[\"]/g, '\\"')
        .replace(/[\n]/g, "\\n")
        .replace(/[\r]/g, "\\r");
    },
    removeWhite: function (e: any) {
      e.normalize();
      for (var n = e.firstChild; n; ) {
        if (n.nodeType == 3) {
          // text node
          if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
            // pure whitespace text node
            var nxt = n.nextSibling;
            e.removeChild(n);
            n = nxt;
          } else n = n.nextSibling;
        } else if (n.nodeType == 1) {
          // element node
          X.removeWhite(n);
          n = n.nextSibling;
        } // any other node
        else n = n.nextSibling;
      }
      return e;
    },
  };
  if (xml.nodeType == 9)
    // document node
    xml = xml.documentElement;
  var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
  return JSON.parse(
    "{\n" +
      tab +
      (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) +
      "\n}"
  );
}

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
      return res.status(httpStatus.OK).send({ result: { address } });
    }
  });

  getLocation = catchAsync(async (req, res) => {
    if (req.body.address) {
      const KEY = "08967D3E-8554-305C-B2F1-01383D0AB0AF";
      console.log(
        "getLoation",
        req.body.address,
        encodeURIComponent(req.body.address)
      );

      const location = await axios.get(
        `http://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(
          req.body.address
        )}&refine=true&simple=false&format=json&type=road&key=${KEY}`
        /*
      {
        params: {
          service: "address",
          request: "GetCoord",
          version: "2.0",
          crs: "epsg:4326",
          address: req.body.address,
          refine: true,
          simple: false,
          format: "json",
          type: "road",
          key: KEY,
        },
      }*/
      );
      console.log("GetLocation", location.data);
      return res
        .status(httpStatus.OK)
        .send({ location: location.data.response.result });
    }
  });

  getBuildFloorInfo = catchAsync(async (req, res) => {
    console.log("getBuildInfo", req.body);
    if (
      req.body.sigunguCd &&
      req.body.bjdongCd &&
      req.body.bun &&
      req.body.ji
    ) {
      const KEY =
        "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
      const URL =
        "http://apis.data.go.kr/1613000/BldRgstService_v2/getBrFlrOulnInfo";
      //const bun = req.body.bun.padStart(4, "0");
      //const ji = req.body.ji.padStart(4, "0");

      try {
        const result = await axios.get(URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            sigunguCd: req.body.sigunguCd,
            bjdongCd: req.body.bjdongCd,
            bun: req.body.bun, //4자리 00패딩
            ji: req.body.ji, //4자리 00패딩
            numOfRows: "30",
            format: "json",
          }),
          headers: {
            Accept: "*",
          },
        });
        console.log("build result", result.data);
        if (result.data) {
          const buildingFloor = xml2json(parseXml(result.data), "");
          return res
            .status(httpStatus.OK)
            .send({ floor: buildingFloor.response.body.items.item });
        }
      } catch (err) {
        console.log("err", err);
        return res
          .state(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getBuildInfo = catchAsync(async (req, res) => {
    console.log("getBuildInfo", req.body);
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

      //const bun = req.body.bun.padStart(4, "0");
      //const ji = req.body.ji.padStart(4, "0");

      try {
        const result = await axios.get(URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            sigunguCd: req.body.sigunguCd,
            bjdongCd: req.body.bjdongCd,
            bun: req.body.bun, //4자리 00패딩
            ji: req.body.ji, //4자리 00패딩
            format: "json",
          }),
          headers: {
            Accept: "*",
          },
          timeout: 10000,
        });
        if (result.data) {
          const building = xml2json(parseXml(result.data), "");
          return res
            .status(httpStatus.OK)
            .send({ building: building.response.body.items.item });
        }
      } catch (err) {
        console.log("building err", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getLandPriceInfo = catchAsync(async (req, res) => {
    if (req.body.pnu && req.body.year) {
      const KEY =
        "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
      const API_URL =
        "http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr";
      try {
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            pnu: req.body.pnu, //"1111017700102110000",
            stdrYear: req.body.year,
            format: "json",
            numOfRows: "10",
            pageNoe: "1",
          }),
          headers: {
            Accept: "*",
          },
          timeout: 5000,
        });
        if (result.data) {
          //@ts-ignore
          //console.log("publicprice result", result.data);
          return res
            .status(httpStatus.OK)
            .send({ price: result.data.indvdLandPrices.field });
        }
      } catch (err) {
        console.log("publicprice err", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getWMSFeatureInfo = catchAsync(async (req, res) => {
    console.log("getWMSFeatureInfo", req.body);
    if (req.body.latitude && req.body.longitude) {
      const key = "851B1D37-7504-38C1-98DF-52F6E03BB2CE";
      try {
        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const EPSG4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG4326, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 0.001 / 2;
        const max_y = center_y + 0.001 / 2;
        const min_x = center_x - 0.002 / 2;
        const max_x = center_x + 0.002 / 2;

        const bbox =
          String(min_x) +
          "," +
          String(min_y) +
          "," +
          String(max_x) +
          "," +
          String(max_y);

        console.log("EPSG4326 bbox", bbox);
        const result = await axios.get(`http://api.vworld.kr/req/wms`, {
          params: {
            service: "WMS",
            //request: "GetMap",
            version: "1.3.0",
            request: "GetFeatureInfo",
            query_layers:
              "lt_l_sprd,lt_c_spbd,lt_c_uq111,lt_c_uq141,lt_c_upisuq151,lt_c_upisuq161,lt_c_upisuq175,lt_c_upisuq171,lt_c_lhblpn",
            //layers: "lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun",
            //styles: "lp_pa_cbnd_bonbun_line,lp_pa_cbnd_bubun_line",
            info_format: "application/json",
            feature_count: 10,
            i: 0,
            j: 0,
            layers:
              "lt_l_sprd,lt_c_spbd,lt_c_uq111,lt_c_uq141,lt_c_upisuq151,lt_c_upisuq161,lt_c_upisuq175,lt_c_upisuq171,lt_c_lhblpn",
            crs: "EPSG:4326",
            bbox: bbox,
            //210983,442831,210997,442847", //", //"14133818.022824,4520485.8511757,14134123.770937,4520791.5992888",
            width: "500",
            height: "500",
            format: "image/png",
            transparent: false,
            bgcolor: "0xFFFFFF",
            exceptions: "text/xml",
            key: key,
            domain: "http://localhost:4000",
          },
          /* 
        headers: {
          Accept: "*",
        },
        */
          //responseType: "arraybuffer",
          timeout: 20000,
        });
        //console.log("WMS_RESULT", result.data);
        if (result.data) {
          //console.log("WMS result", result.data);
          return res.status(httpStatus.OK).send({ result: result.data });
        }
        //return res.status(httpStatus.OK).send({ result: { address } });
      } catch (err) {
        console.log("getWMSInfo error", err);
        return res.status(httpStatus.OK).send({ result: "" });
      }
    }
  });

  getWMSLegend = catchAsync(async (req, res) => {
    console.log("getWMSFeatureInfo", req.body);
    const key = "851B1D37-7504-38C1-98DF-52F6E03BB2CE";
    if (req.body && req.body.layer) {
      try {
        const result = await axios.get(`http://api.vworld.kr/req/image`, {
          params: {
            service: "image",
            request: "GetLegendGraphic",
            format: "png",
            version: "2.0",
            errorFormat: "json",
            //layers: "lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun",
            //styles: "lp_pa_cbnd_bonbun_line,lp_pa_cbnd_bubun_line",
            layer: req.body.layer,
            style: req.body.layer,
            //210983,442831,210997,442847", //", //"14133818.022824,4520485.8511757,14134123.770937,4520791.5992888",
            key: key,
            type: "ALL",
          },
          /* 
        headers: {
          Accept: "*",
        },
        */
          responseType: "arraybuffer",
          timeout: 20000,
        });
        if (result.data) {
          //console.log("WMS LEGEND", result.data);
          //res.status(httpStatus.OK).send(result.data);
          res.writeHead(200, {
            "Content-Type": "image/png;charset=UTF-8",
          });
          res.write(result.data);
          res.end();
        }
        //return res.status(httpStatus.OK).send({ result: { address } });
      } catch (err) {
        console.log("getWMSInfo error", err);
        return res.status(httpStatus.OK).send();
      }
    }
  });

  getWMSInfo = catchAsync(async (req, res) => {
    console.log("getWMSInfo", req.body);
    if (req.body.latitude && req.body.longitude) {
      const key = "851B1D37-7504-38C1-98DF-52F6E03BB2CE";
      console.log("getWMSInfo");
      try {
        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const EPSG4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG4326, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 0.001 / 2;
        const max_y = center_y + 0.001 / 2;
        const min_x = center_x - 0.002 / 2;
        const max_x = center_x + 0.002 / 2;

        const bbox =
          String(min_x) +
          "," +
          String(min_y) +
          "," +
          String(max_x) +
          "," +
          String(max_y);

        console.log("EPSG4326 bbox", bbox);
        const result = await axios.get(`http://api.vworld.kr/req/wms`, {
          params: {
            service: "WMS",
            request: "GetMap",
            version: "1.3.0",
            //request: "GetFeatureInfo",
            //query_layers: "lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun",
            //layers: "lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun",
            //styles: "lp_pa_cbnd_bonbun_line,lp_pa_cbnd_bubun_line",
            //info_format: "text/html",
            layers:
              "lt_l_sprd,lt_c_spbd,lt_c_uq111,lt_c_uq141,lt_c_upisuq151,lt_c_upisuq161,lt_c_upisuq175,lt_c_upisuq171,lt_c_lhblpn",
            crs: "EPSG:4326",
            bbox: bbox,
            //210983,442831,210997,442847", //", //"14133818.022824,4520485.8511757,14134123.770937,4520791.5992888",
            width: "500",
            height: "500",
            format: "image/png",
            transparent: false,
            bgcolor: "0xFFFFFF",
            exceptions: "text/xml",
            key: key,
            domain: "http://localhost:4000",
          },
          /* 
        headers: {
          Accept: "*",
        },
        */
          responseType: "arraybuffer",
          timeout: 20000,
        });
        //console.log("WMS_RESULT", result.data);
        if (result.data) {
          //console.log("WMS result", result.data);
          sharp(result.data)
            .resize(500)
            .composite([{ input: "circle.png", blend: "over" }])
            .toBuffer()
            .then(function (outputBuffer) {
              // outputBuffer contains upside down, 300px wide, alpha channel flattened
              // onto orange background, composited with overlay.png with SE gravity,
              // sharpened, with metadata, 90% quality WebP image data. Phew!
              res.writeHead(200, {
                "Content-Type": "image/png;charset=UTF-8",
              });
              res.write(outputBuffer);
              res.end();
            });
          /*
          fs.writeFile("test.png", result.data, "binary", function (err) {
            console.log("write binary error", err);
            sharp("test.png")
              .resize(500)
              .composite([{ input: "circle.png", blend: "over" }])
              .toBuffer()
              .then(function (outputBuffer) {
                // outputBuffer contains upside down, 300px wide, alpha channel flattened
                // onto orange background, composited with overlay.png with SE gravity,
                // sharpened, with metadata, 90% quality WebP image data. Phew!
                res.writeHead(200, {
                  "Content-Type": "image/png;charset=UTF-8",
                });
                res.write(outputBuffer);
                res.end();
              });
          });
          */
          //console.log("WMS result", result);
          //@ts-ignore
          //console.log("result", "data:image/png;base64," + base64EncodedStr);
          /*
          res.writeHead(200, { "Content-Type": "image/png;charset=UTF-8" });
          res.write(result.data);
          res.end();
          */
        }
        //return res.status(httpStatus.OK).send({ result: { address } });
      } catch (err) {
        console.log("getWMSInfo error", err);
        return res.status(httpStatus.OK).send({ result: "" });
      }
    }
  });

  getSpaceWMSInfo = catchAsync(async (req, res) => {
    //console.log("getLandPlanWMSInfo", req.body);
    if (req.body.type && req.body.longitude && req.body.latitude) {
      console.log("getSpaceWMS", req.body);
      try {
        /*
        const wgs84 =
          "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        const epgs5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        console.log("wsg84", wgs84, epgs5174);
        const result5174 = proj4(
          wgs84,
          epgs5174,
          [127.7063258909378, 37.8216025075155]
        );
        console.log("result5174", result5174);
        */
        const KEY = "";
        const API_URL = "http://openapi.nsdi.go.kr/nsdi/map/IndstrySpceService";

        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG5174, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 150;
        const max_y = center_y + 150;
        const min_x = center_x - 200;
        const max_x = center_x + 200;

        const bbox =
          String(min_y) +
          "," +
          String(min_x) +
          "," +
          String(max_y) +
          "," +
          String(max_x);

        console.log("spaceWMS loglat", req.body);
        console.log("spaceWMS bbox", bbox);
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            authkey: KEY,
            layers: "68,69,70,71,72,73,74",
            crs: "EPSG:5174",
            bbox: bbox, //"217365,447511,217636,447701",
            width: "600",
            height: "500",
            format: "image/png",
            transparent: "false",
            bgcolor: "0xFFFFFF",
            exceptions: "blank",
          }),
          headers: {
            Accept: "*",
          },
          responseType: "arraybuffer",
          timeout: 20000,
        });
        if (result.data) {
          //console.log("landspace WMS result", result.data);
          //@ts-ignore
          //console.log("result", "data:image/png;base64," + base64EncodedStr);
          res.writeHead(200, { "Content-Type": "image/png;charset=UTF-8" });
          res.write(result.data);
          res.end();
        }
      } catch (err) {
        console.log("WMS error", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getLandSpaceWMSInfo = catchAsync(async (req, res) => {
    //console.log("getLandPlanWMSInfo", req.body);
    if (req.body.type && req.body.longitude && req.body.latitude) {
      console.log("getLandSpaceWMSInfo", req.body);
      try {
        /*
        const wgs84 =
          "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        const epgs5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        console.log("wsg84", wgs84, epgs5174);
        const result5174 = proj4(
          wgs84,
          epgs5174,
          [127.7063258909378, 37.8216025075155]
        );
        console.log("result5174", result5174);
        */
        const KEY =
          "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
        const API_URL =
          "http://apis.data.go.kr/1611000/nsdi/map/IndstrySpceService";

        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG5174, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 150;
        const max_y = center_y + 150;
        const min_x = center_x - 200;
        const max_x = center_x + 200;

        const bbox =
          String(min_y) +
          "," +
          String(min_x) +
          "," +
          String(max_y) +
          "," +
          String(max_x);

        console.log("landspace loglat", req.body);
        console.log("landpsace bbox", bbox);
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            crs: "EPSG:5174",
            bbox: bbox, //"217365,447511,217636,447701",
            width: "600",
            height: "500",
            format: "image/png",
            transparent: "false",
            bgcolor: "0xFFFFFF",
            exceptions: "blank",
          }),
          headers: {
            Accept: "*",
          },
          responseType: "arraybuffer",
          timeout: 20000,
        });
        if (result.data) {
          //console.log("landspace WMS result", result.data);
          //@ts-ignore
          //console.log("result", "data:image/png;base64," + base64EncodedStr);
          res.writeHead(200, { "Content-Type": "image/png;charset=UTF-8" });
          res.write(result.data);
          res.end();
        }
      } catch (err) {
        console.log("WMS error", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getLandPlanWFSInfo = catchAsync(async (req, res) => {
    //console.log("getLandPlanWMSInfo", req.body);
    if (req.body.pnu && req.body.longitude && req.body.latitude) {
      try {
        /*
        const wgs84 =
          "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        const epgs5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        console.log("wsg84", wgs84, epgs5174);
        const result5174 = proj4(
          wgs84,
          epgs5174,
          [127.7063258909378, 37.8216025075155]
        );
        console.log("result5174", result5174);
        */
        const KEY =
          "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
        const API_URL =
          "http://apis.data.go.kr/1611000/nsdi/LandUseService/wfs/getLandUseWFS";

        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG5174, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 200;
        const max_y = center_y + 200;
        const min_x = center_x - 250;
        const max_x = center_x + 250;

        const bbox =
          String(min_y) +
          "," +
          String(min_x) +
          "," +
          String(max_y) +
          "," +
          String(max_x);

        console.log("WFS loglat", req.body);
        console.log("WFS bbox", bbox);
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            type: "F176",
            pnu: req.body.pnu,
            maxFeatures: "10",
            srsName: "EPSG:5174",
            bbox: bbox, //"217365,447511,217636,447701",
          }),
          headers: {
            Accept: "*",
          },
          timeout: 20000,
        });
        if (result.data) {
          //console.log("WFS result", result);
          const wfs = xml2json(parseXml(result.data), "");

          //@ts-ignore
          //console.log("result", "data:image/png;base64," + base64EncodedStr);
          return res.status(httpStatus.OK).send({ wfs });
        }
      } catch (err) {
        console.log("WFS error", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getLandPlanWMSInfo = catchAsync(async (req, res) => {
    //console.log("getLandPlanWMSInfo", req.body);
    if (req.body.longitude && req.body.latitude) {
      try {
        /*
        const wgs84 =
          "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        const epgs5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        console.log("wsg84", wgs84, epgs5174);
        const result5174 = proj4(
          wgs84,
          epgs5174,
          [127.7063258909378, 37.8216025075155]
        );
        console.log("result5174", result5174);
        */
        const KEY =
          "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
        const API_URL =
          "http://apis.data.go.kr/1611000/nsdi/LandUseService/wms/getLandUseWMS";

        const EPSG5174 =
          "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";
        const GRS80 = "+proj=longlat +ellps=GRS80 +no_defs";
        const longitude = parseFloat(req.body.longitude);
        const latitude = parseFloat(req.body.latitude);

        const transResult = proj4(GRS80, EPSG5174, [longitude, latitude]);

        const center_y = transResult[0];
        const center_x = transResult[1];

        const min_y = center_y - 150;
        const max_y = center_y + 150;
        const min_x = center_x - 200;
        const max_x = center_x + 200;

        const bbox =
          String(min_y) +
          "," +
          String(min_x) +
          "," +
          String(max_y) +
          "," +
          String(max_x);

        console.log("landplanWMS loglat", req.body);
        console.log("landplanWMS bbox", bbox);
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            layers: "176",
            crs: "EPSG:5174",
            bbox: bbox, //"217365,447511,217636,447701",
            width: "600",
            height: "500",
            format: "image/png",
            transparent: "false",
            bgcolor: "0xFFFFFF",
            exceptions: "blank",
          }),
          headers: {
            Accept: "*",
          },
          responseType: "arraybuffer",
          timeout: 20000,
        });
        if (result.data) {
          //console.log("WMS result", result);
          //@ts-ignore
          //console.log("result", "data:image/png;base64," + base64EncodedStr);
          res.writeHead(200, { "Content-Type": "image/png;charset=UTF-8" });
          res.write(result.data);
          res.end();
        }
      } catch (err) {
        console.log("WMS error", err);
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
    }
  });

  getLandPlanInfo = catchAsync(async (req, res) => {
    if (req.body.pnu) {
      const KEY =
        "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
      const API_URL =
        "http://apis.data.go.kr/1611000/nsdi/LandUseService/attr/getLandUseAttr";

      try {
        const result = await axios.get(API_URL, {
          params: new URLSearchParams({
            serviceKey: KEY,
            pnu: req.body.pnu,
            cnflcAt: "1",
            format: "json",
            numOfRows: "100",
            pageNoe: "1",
          }),
          headers: {
            Accept: "*",
          },
          timeout: 5000,
        });
        if (result.data) {
          //@ts-ignore
          return res
            .status(httpStatus.OK)
            .send({ landPlan: result.data.landUses.field });
        }
      } catch (err) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: JSON.stringify(err) });
      }
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
