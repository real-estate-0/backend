import pptxgen from "pptxgenjs";
//const pptxgen = require("pptxgenjs");
//import pptxgen from "pptxgenjs";

const pres = new pptxgen();

const COLOR_GREEN = "269a26";
const COLOR_GRAY = "919595";
const COLOR_WHITE = "ffffff";
const COLOR_BLACK = "000000";
const COLOR_LIGHT_GREEN = "c6e0b4";
const COLOR_HEAVY_GREEN = "a9d08e";
const COLOR_RED = "c80d3a";

const columnOptions = {
  fontSize: 8,
  align: "center",
  border: { pt: 1, color: COLOR_BLACK },
  fill: COLOR_WHITE,
};

const headerOptions = {
  fontSize: 8,
  align: "center",
  border: { pt: 1, color: COLOR_BLACK },
  fill: COLOR_LIGHT_GREEN,
};

const renderTemplate = (slide) => {
  slide.addShape(pres.ShapeType.rtTriangle, {
    x: "0.1%",
    y: "1%",
    w: "2%",
    h: "3.5%",
    fill: { color: COLOR_GREEN },
    line: { color: COLOR_GREEN, width: 2 },
    flipV: true,
  });
  slide.addShape(pres.ShapeType.rtTriangle, {
    x: "54%",
    y: "1.2%",
    w: "1%",
    h: "3.5%",
    fill: { color: COLOR_GREEN },
    line: { color: COLOR_GREEN, width: 2 },
    flipH: true,
  });
  slide.addShape(pres.ShapeType.rect, {
    x: "55.1%",
    y: "1%",
    w: "45%",
    h: "4%",
    fill: { color: COLOR_GREEN },
  });
  slide.addText("(주)케이빌딩 부동산중개법인", {
    x: "77%",
    y: "3%",
    fontSize: 11,
    color: COLOR_WHITE,
    italic: true,
  });
  //footer
  slide.addShape(pres.ShapeType.rtTriangle, {
    x: "69%",
    y: "95.2%",
    w: "0.7%",
    h: "3.5%",
    fill: { color: COLOR_GREEN },
    line: { color: COLOR_GREEN, width: 2 },
    flipV: true,
  });

  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: "95%",
    w: "69%",
    h: "4%",
    fill: { color: COLOR_GREEN },
  });
  slide.addText("(주)케이빌딩 부동산중개법인", {
    x: "2%",
    y: "97%",
    fontSize: 11,
    color: COLOR_WHITE,
    italic: true,
  });

  slide.addShape(pres.ShapeType.rtTriangle, {
    x: "71.3%",
    y: "95.2%",
    w: "0.7%",
    h: "3.5%",
    fill: { color: COLOR_GRAY },
    line: { color: COLOR_GRAY, width: 2 },
    flipH: true,
  });

  slide.addShape(pres.ShapeType.rect, {
    x: "72%",
    y: "95%",
    w: "28%",
    h: "4%",
    fill: { color: COLOR_GRAY },
  });

  slide.addText("Strictly Private Business Paper", {
    x: "75%",
    y: "97%",
    fontSize: 9,
    color: COLOR_WHITE,
    italic: true,
  });
};

const render1 = (slide, address) => {
  slide.addText(address, {
    x: 0.7,
    y: 1,
    fontSize: 20,
    color: COLOR_BLACK,
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

const render2 = (slide, imagePath) => {
  //builiding image
  slide.addImage({
    path: imagePath,
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
        ...headerOptions,
        rowspan: 2,
        fill: COLOR_HEAVY_GREEN,
      },
    },
    {
      text: "",
      options: {
        ...columnOptions,
        colspan: 4,
      },
    },
  ]);
  locationRows.push([
    {
      text: "교통",
      options: headerOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "도로",
      options: headerOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
  ]);

  slide.addTable(locationRows, {
    x: "49%",
    y: 0.4,
    w: 4.8,
    h: 0.3,
  });
  const landRows = [];

  landRows.push([
    {
      text: "토지",
      options: {
        ...headerOptions,
        fill: COLOR_HEAVY_GREEN,
        rowspan: 3,
      },
    },
    {
      text: "대지면적",
      options: headerOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "data",
      options: { columnOptions, border: { pt: 1, color: COLOR_RED } },
    },
  ]);
  landRows.push([
    {
      text: "용도지역",
      options: headerOptions,
    },
    {
      text: "data",
      options: { ...columnOptions, colspan: 3, border: { pt: 0 } },
    },
  ]);
  landRows.push([
    {
      text: "공시지가",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "합계",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  slide.addTable(landRows, {
    x: "49%",
    y: 0.8,
    w: 4.8,
    h: 0.5,
  });

  const buildingRows = [];

  buildingRows.push([
    {
      text: "건물",
      options: { ...headerOptions, rowspan: 6, fill: COLOR_HEAVY_GREEN },
    },
    {
      text: "건축면적",
      options: headerOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "data",
      options: { columnOptions, border: { pt: 1, color: COLOR_RED } },
    },
  ]);

  buildingRows.push([
    {
      text: "연면적",
      options: headerOptions,
    },
    {
      text: "data",
      options: { ...columnOptions, colspan: 3, border: { pt: 0 } },
    },
    {
      text: "",
      options: columnOptions,
    },
    {
      text: "data",
      options: {
        ...columnOptions,
        colspan: 3,
        border: { pt: 1, color: COLOR_RED },
      },
    },
  ]);

  buildingRows.push([
    {
      text: "용적률 산정용 연면적",
      options: { ...headerOptions, fontSize: 6 },
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "구조",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);
  buildingRows.push([
    {
      text: "건폐율",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "용적률",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  buildingRows.push([
    {
      text: "층수",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "승강기",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  buildingRows.push([
    {
      text: "주차",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "준공일",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  slide.addTable(buildingRows, {
    x: "49%",
    y: 1.56,
    w: 4.8,
    h: 1.4,
  });

  const priceRows = [];
  priceRows.push([
    {
      text: "금액",
      options: { ...headerOptions, fill: COLOR_HEAVY_GREEN, rowspan: 3 },
    },
    {
      text: "보증금",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "임대료",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  priceRows.push([
    {
      text: "관리비",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "수익률",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
  ]);

  priceRows.push([
    {
      text: "평단가",
      options: headerOptions,
    },
    {
      text: "data",
      options: columnOptions,
    },
    {
      text: "매매가",
      options: headerOptions,
    },
    {
      text: "data",
      options: { ...columnOptions, border: { pt: 1, color: COLOR_RED } },
    },
  ]);

  slide.addTable(priceRows, {
    x: "49%",
    y: 3.1,
    w: 4.8,
    h: 0.7,
  });

  //extra
  slide.addTable(
    [
      [
        {
          text: "",
          options: { border: { pt: 1, color: COLOR_BLACK, fill: COLOR_WHITE } },
        },
      ],
    ],
    {
      x: "49%",
      y: 3.9,
      w: 4.8,
      h: 1.3,
    }
  );
};

const render3 = (slide, floors) => {
  const rows = [];
  //rent table
  rows.push([
    {
      text: "운영수입",
      options: {
        ...headerOptions,
        rowspan: 9,
        //margin: [20, 0, 0, 0],
      },
    },
    { text: "층수", options: headerOptions },
    { text: "용도(임차구성)", options: headerOptions },
    { text: "임대면적", options: headerOptions },
    { text: "계약기간", options: headerOptions },
    { text: "보증금", options: headerOptions },
    { text: "임대료", options: headerOptions },
    { text: "관리비", options: headerOptions },
  ]);
  /*
  *
  function resize(arr, newSize, defaultValue) {
    return [ ...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue)];
  }
  */
  Array.from({ length: 7 }).map((item, index) => {
    console.log("number", index, index < floors.length);
    if (index < floors.length) {
      rows.push([
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
        { text: index + 1, options: columnOptions },
      ]);
    } else {
      rows.push([
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
        { text: "", options: columnOptions },
      ]);
    }
  });

  rows.push([
    { text: "합계", options: { ...headerOptions, colspan: 4 } },
    { text: "1", options: columnOptions },
    { text: "2", options: columnOptions },
    { text: "3", options: columnOptions },
  ]);
  slide.addTable(rows, { x: 0.2, y: 0.4, w: 9.4 });

  //summary
  const sumRows = [];
  sumRows.push([
    {
      text: "예상 운영수입",
      options: {
        ...headerOptions,
        rowspan: 7,
        margin: [10, 0, 0, 0],
      },
    },
    { text: "구분", options: headerOptions },
    { text: "월간", options: headerOptions },
    { text: "연간", options: headerOptions },
  ]);
  sumRows.push([
    { text: "보증금", options: headerOptions },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  sumRows.push([
    { text: "임대료", options: headerOptions },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  sumRows.push([
    { text: "관리비", options: headerOptions },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  sumRows.push([
    { text: "임대료합계", options: headerOptions },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  sumRows.push([
    { text: "매매대금", options: { ...headerOptions, colspan: 2 } },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  sumRows.push([
    { text: "예상수익률", options: { ...headerOptions, colspan: 2 } },
    { text: "", options: columnOptions },
    { text: "", options: columnOptions },
  ]);
  slide.addTable(sumRows, {
    x: 0.2,
    y: "58%",
    w: 4.5,
    h: 2,
  });

  //extra
  slide.addTable(
    [
      [
        {
          text: "",
          options: { border: { pt: 1, color: COLOR_BLACK, fill: COLOR_WHITE } },
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

const render7 = (slide, imagePath1, imagePath2, imagePath3, imagePath4) => {
  //builiding image
  const START_X1 = 0.2;
  const START_Y1 = 0.4;
  const WIDTH = 4.3;
  const HEIGHT = 2.4;
  const START_X2 = 4.7;
  const START_Y2 = 2.9;
  slide.addImage({
    path: imagePath1,
    x: START_X1,
    y: START_Y1,
    w: WIDTH,
    h: HEIGHT,
  });
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
};

const run = async () => {
  //1Page
  const slide1 = pres.addSlide();
  renderTemplate(slide1);
  render1(slide1, "동대문구 장안동 102-7");

  //2page building
  const slide2 = pres.addSlide();
  renderTemplate(slide2);
  render2(slide2, "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg");

  //3page rent
  const slide3 = pres.addSlide();
  renderTemplate(slide3);
  render3(slide3, [1, 2, 3, 4]);

  //4page empty
  const slide4 = pres.addSlide();
  renderTemplate(slide4);

  //4page empty
  const slide5 = pres.addSlide();
  renderTemplate(slide5);

  //6page empty
  const slide6 = pres.addSlide();
  renderTemplate(slide6);

  //7page images
  const slide7 = pres.addSlide();
  renderTemplate(slide7);
  render7(
    slide7,
    "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg"
  );

  pres.writeFile({ fileName: "Sample.pptx" });
};

run();
