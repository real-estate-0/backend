type Content = {
  type?: "table" | "image" | "text";
  content?: any;
};

type IUser = {
  _id?: string;
  userId?: string;
  name?: string;
  password?: string;
  role?: string;
  createdTime?: Date;
};

interface IParagraph {
  type: string;
  title?: string;
  text?: string;
  tableBody?: any;
  tableColumn?: string;
  image?: string;
}

interface IReport {
  _id?: string;
  paragraphs?: IParagraph[];
  title?: string;
  location?: TLocation;
  building?: TBuilding;
  detail?: string;
  publicPrice?: TPublicPrice[];
  floor?: TFloor[];
  landPlanWMS?: TLandPlanWMS;
  landPlan?: TLandPlan[];
  tags?: string[];
  createUserObjectId?: string;
  updateUserObjectId?: string;
  createdTime?: Date;
  updatedTime?: Date;
  map?: string;
  roadview?: string;
  pfper?: string;
}

type AppState = {
  accessToken: string | undefined;
  openSideBar: boolean;
  address: string | undefined;
  lat: number | undefined;
  long: number | undefined;
  loading: boolean;
  users: IUser[];
};

type ReduxState = {
  appReducer: AppState;
};

type TERROR_RESPONSE = {};

type TBuilding = {
  address?: string;
  latitude?: number;
  longitude?: number;
  mainPurpsCdNm?: string;
  etcPurps?: string;
  roofCd?: string;
  roofCdNm?: string;
  etcRoof?: string;
  hhldCnt?: string;
  fmlyCnt?: string;
  heit?: string;
  grndFlrCnt?: string;
  ugrndFlrCnt?: string;
  rideUseElvtCnt?: string;
  emgenUseElvtCnt?: string;
  atchBldCnt?: string;
  atchBldArea?: string;
  totDongTotArea?: string;
  indrMechUtcnt?: string;
  indrMechArea?: string;
  oudrMechUtcnt?: string;
  oudrMechArea?: string;
  indrAutoUtcnt?: string;
  indrAutoArea?: string;
  oudrAutoUtcnt?: string;
  oudrAutoArea?: string;
  pmsDay?: string;
  stcnsDay?: string;
  useAprDay?: string;
  pmsnoYear?: string;
  pmsnoKikCd?: string;
  pmsnoKikCdNm?: string;
  pmsnoGbCd?: string;
  pmsnoGbCdNm?: string;
  hoCnt?: string;
  engrGrade?: string;
  engrRat?: string;
  engrEpi?: string;
  gnBldGrade?: string;
  gnBldCert?: string;
  itgBldGrade?: string;
  itgBldCert?: string;
  crtnDay?: string;
  rnum?: string;
  platPlc?: string;
  sigunguCd?: string;
  bjdongCd?: string;
  platGbCd?: string;
  bun?: string;
  ji?: string;
  mgmBldrgstPk?: string;
  regstrGbCd?: string;
  regstrGbCdNm?: string;
  regstrKindCd?: string;
  regstrKindCdNm?: string;
  newPlatPlc?: string;
  bldNm?: string;
  splotNm?: string;
  block?: string;
  lot?: string;
  bylotCnt?: string;
  naRoadCd?: string;
  naBjdongCd?: string;
  naUgrndCd?: string;
  naMainBun?: string;
  naSubBun?: string;
  dongNm?: string;
  mainAtchGbCd?: string;
  mainAtchGbCdNm?: string;
  platArea?: string;
  archArea?: string;
  bcRat?: string;
  totArea?: string;
  vlRatEstmTotArea?: string;
  vlRat?: string;
  strctCd?: string;
  strctCdNm?: string;
  etcStrct?: string;
  mainPurpsCd?: string;
  rserthqkDsgnApplyYn?: string;
  rserthqkAblty?: string;
  groundArea?: number; //대지면적
  buildArea?: number; //건축면적
  totalArea?: number; //연면적
  useArea?: number; //용적률 산정용 연먼적
  usePer?: number; //용적률
  buildPer?: number; //건폐율
  useType?: string; //용도지역
  size?: string; //규모
  ev?: string; //엘리베이터
  parking?: string; //주차
  road?: string; //도록
  transfer?: string; //교통
  openDay?: string; //준공일
  structure?: string; //구조
  fee?: strnig; //보증금
  rent?: strnig; //월세
  management?: string; //관리지
  pricePer?: number; //토지가(평당)
  standardPrice?: string; //공시지가
  totalPrice?: string; //총액
  price?: number; //매매가
  pfper?: number; //수익율
};

type TFloor = {
  rnum?: string;
  platPlc?: string;
  sigunguCd?: string;
  bjdongCd?: string;
  platGbCd?: string;
  bun?: string;
  ji?: string;
  PK?: string;
  newPlatPlc?: string;
  bldNm?: string;
  splotNm?: string;
  block?: string;
  lot?: string;
  naRoadCd?: string;
  naBjdongCd?: string;
  naUgrndCd?: string;
  naMainBun?: string;
  naSubBun?: string;
  dongNm?: string;
  flrGbCd?: string;
  flrGbCdNm?: string;
  flrNo?: string;
  flrNoNm?: string;
  strctCd?: string;
  strctCdNm?: string;
  etcStrct?: string;
  mainPurpsCd?: string;
  mainPurpsCdNm?: string;
  etcPurps?: string;
  mainAtchGbCd?: string;
  mainAtchGbCdNm?: string;
  area?: string;
  areaExctYn?: string;
  crtnDay?: string;
};

type TPublicPrice = {
  stdrYear?: string;
  stdrMt?: string;
  pblntfPclnd?: string;
  pblntfDe?: string;
  lastUpdtDt?: string;
};

type TRent = {
  floor: string;
  purpose: string;
  size: string;
  deposit: string;
  month: string;
  management: string;
};

type TLandPlan = {
  pnu: string;
  ldCode: string;
  ldCodeNm: string;
  regstrSeCode: string;
  regstrSeCodeNm: string;
  mnnmSlno: string;
  manageNo: string;
  cnflcAt: string;
  cnflcAtNm: string;
  prposAreaDstrcCode: string;
  prposAreaDstrcCodeNm: string;
  registDt: string;
  lastUpdtDt: string;
};
