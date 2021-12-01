import express, { NextFunction } from "express";
import config from "config";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import routes from "./route/v1";
import { ApiError } from "./utils/ApiError";
import { jwtStrategy } from "./config/passport";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { createLogger } from "./logger";
import { accessLogStream } from "./logger/morgan";
import path from "path";
import axios from "axios";
import url from "url";
import proxy from 'html2canvas-proxy';

const app: express.Application = express();

const logger = createLogger("app", "app");
const runMode = config.get("env");

logger.info(`Application run mode: ${runMode}`);

/*
 * middleware
 */
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.urlencoded({ limit: "2mb", extended: false }));
app.use(express.json({ limit: "2mb" }));

//error handler
//app.use(errorConverter);
//xss
//app.use(xss());

// gzip compression
app.use(compression());

//enable cors
app.use(cors());

//jwt authentcation
passport.use(jwtStrategy);
app.use(passport.initialize());

/*
 * route
 */

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "it's me" });
});

app.use('/capture', proxy());

/**
 * it give server information to client
 */

/*
app.post("/api/v1/address", async (req: Request, res: Response) => {
  const API_KEY = "devU01TX0FVVEgyMDIxMTEyNjA2MzczNjExMTk1NTI=";
  const ADD_URL = "https://www.juso.go.kr/addrlink/addrLinkApi.do";

  //@ts-ignore
  const result = await axios.post(
    ADD_URL,
    new url.URLSearchParams({
      confmKey: API_KEY,
      currentPage: "1",
      countPerPage: "10",
      keyword: req.body.address,
      resultType: "json",
    })
  );
  //@ts-ignore
  console.log("address", result);
});
*/

app.get("/server", (req: Request, res: Response) => {
  res.status(200).json({
    result: {
      socket: {
        url: "ws://127.0.0.1:5000",
        ip: "127.0.0.1",
        port: "5000",
        scheme: "ws",
      },
      api: {
        url: "http://127.0.0.1:3000",
        ip: "127.0.0.1",
        port: "4000",
        scheme: "http",
      },
    },
  });
});

//console.log("routes", routes);

/*
 * Route
 */

/*
routes.stack.forEach((mid) => {
  if (mid.route) {
    console.log("auth router", mid.route);
  } else if (mid.name === "router") {
    mid.handle.stack.forEach((han) => {
      console.log("auth hand router", han.route);
    });
  }
});
*/

app.use("/api/v1", routes);

app.get("*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});
/*
 * Common Error
 */

//send 404 error for unknkow api request

app.use((error, req, res, next) => {
  logger.error("error handler:" + JSON.stringify(error));
  if (error) {
    return res
      .status(error.statusCode)
      .json({ errorMessage: error.errorMessage, errorCode: error.errorCode });
  }
  return res.status(500);
});

export { app };
