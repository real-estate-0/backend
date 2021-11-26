const axios = require('axios')
const url = require('url');

KEY = "devU01TX0FVVEgyMDIxMTEyNjA2MzczNjExMTk1NTI="
URL = "https://www.juso.go.kr/addrlink/addrLinkApi.do"

axios.post(URL, new url.URLSearchParams({
  confmKey: KEY,
  currentPage: 1,
  countPerPage: 10,
  keyword: "문정동31-3",
  resultType: "json",
})).then((result) =>{
  console.log('result', result.data)
}).catch((error) =>{
  console.log('error', error)
})


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
