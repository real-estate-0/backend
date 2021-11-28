const axios = require("axios");
const url = require("url");
/*
KEY = "devU01TX0FVVEgyMDIxMTEyNjA2MzczNjExMTk1NTI=";
URL = "https://www.juso.go.kr/addrlink/addrLinkApi.do";

axios
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
    console.log("result", result.data.results.juso);
  })
  .catch((error) => {
    console.log("error", error);
  });
*/

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
 */
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
