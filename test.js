const axios = require("axios");
const url = require("url");

function run(){

const key = "851B1D37-7504-38C1-98DF-52F6E03BB2CE";
console.log("getWMSInfo");
/*
const WMS_RESULT = axios
  .get(`http://api.vworld.kr/req/wms?key=${key}&[WMS Param]`, {
    params: {
      SERVICE: "WMS",
      REQUEST: "GetMap",
      VERSION: "1.3.0",
      LAYERS: "lt_c_ademd,lt_c_lhblpn",
      CRS: "EPSG:4326",
      BBOX: "14133818.022824,4520485.8511757,14134123.770937,4520791.5992888",
      WIDTH: "256",
      HEIGHT: "256",
      FORMAT: "image/png",
      TRANSPARENT: false,
      BGCOLOR: "0xFFFFFF",
      EXCEPTIONS: "text/xml",
      KEY: key,
      DOMAIN: "127.0.0.1",
    },
  })
  .then((result) => console.log("WMS_RESULT", result.data));
*/

//KEY="devU01TX0FVVEgyMDIyMDIyNTEyMjgxMDExMjI3OTU=";
KEY="devU01TX0FVVEgyMDIyMDIyNTEyMjQ0MjExMjI3OTQ=";
//KEY = "devU01TX0FVVEgyMDIxMTEyNjA2MzczNjExMTk1NTI=";

//KEY="devU01TX0FVVEgyMDIyMDIyNTEyMjMxNzExMjI3OTM";
//KEY="U01TX0FVVEgyMDIyMDIyNTEyMjAyOTExMjI3OTI";
URL = "https://www.juso.go.kr/addrlink/addrLinkApi.do";

const result = axios
  .post(
    URL,
    new url.URLSearchParams({
      confmKey: KEY,
      currentPage: 1,
      countPerPage: 10,
      keyword: "문정동31-3",
      resultType: "json",
      addInfoYn: "Y",
    })
  )
  .then((result) => {
    console.log("address result", result.data);
  })
  .catch((error) => {
    console.log("address error", error);
  });

console.log('address-1 result', result)
/*
confmKey  String  Y - 신청시 발급받은 승인키
currentPage Integer Y 1 현재 페이지 번호
countPerPage  Integer Y 10  페이지당 출력할 결과 Row 수
keyword String  Y - 주소 검색어
resultType  String  N xml 검색결과형식 설정(xml, json)
hstryYn String  N N * 2020년12월8일 추가된 항목
변동된 주소정보 포함 여부
firstSort String  N none  * 2020년12월8일 추가된 항목
정확도순 정렬(none), 우선정렬(road: 도로명 포함, location: 지번 포함)
※ keyword(검색어)가 우선정렬 항목에 포함된 결과 우선 표출
addInfoYn String  N N * 2020년12월8일 추가된 항목
*/

/* 건축물대장
KEY =
  "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
URL = "http://apis.data.go.kr/1613000/BldRgstService_v2/getBrTitleInfo";

axios
  .get(
    URL,
    {
      params: new url.URLSearchParams({
        serviceKey: KEY,
        sigunguCd: "11710",
        bjdongCd: "10800",
        bun: "0031",
        ji: "0003",
      }),
    },
    { headers: { Accept: "*" } }
  )
  .then((result) => {
    console.log("result", result.data.response.body.items.item);
  });
*/

/*토지이용계획
KEY =
  "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
URL =
  "http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr";
let queryParams = "?" + "serviceKey" + "=" + encodeURIComponent(KEY);
queryParams += "&" + "pnu" + "=" + encodeURIComponent("1111017700102110000");
queryParams += "&" + "stdrYear" + "=" + encodeURIComponent("2020");
queryParams += "&" + "format" + "=" + encodeURIComponent("json");
queryParams += "&" + "numOfRows" + "=" + encodeURIComponent("10");
queryParams += "&" + "pageNo" + "=" + encodeURIComponent("1");

console.log("URL", URL + queryParams);
axios
  .get(URL, {
    params: new url.URLSearchParams({
      serviceKey: KEY,
      pnu: "1111017700102110000",
      format: "json",
      numOfRows: "10",
      pageNoe: "1",
      stdrYear: "2020",
    }),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "*",
    },
  })
  .then((result) => {
    console.log("result", result.data.indvdLandPrices.field);
  });
*/
/**
 * 공시지가
KEY =
  "UQoQhO/CpOPm65pe+obx1jBuKFhT+2tXx2jIFwwsrkp5Q/TfZw8hYAv3j4hSN+n0Cs35+6ZeuKGGGb07pX+qCg==";
URL =
  "http://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr";

axios
  .get(URL, {
    params: new URLSearchParams({
      serviceKey: KEY,
      pnu: "1111017700102110000",
      stdrYear: "2020",
      format: "json",
      numOfRows: "10",
      pageNoe: "1",
    }),
    headers: {
      Accept: "*",
    },
  })
  .then((result) => {
    console.log("result", result.data.indvdLandPrices.field);
  });
  */
}

run()
