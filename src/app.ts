import express, { NextFunction } from "express";
import config from "config";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import xss from "xss-clean";
import passport from "passport";
import routes from "./route/v1";
import { errorConverter } from "./middlewares/error";
import { ApiError } from "./utils/ApiError";
import { jwtStrategy } from "./config/passport";
import { authLimiter } from "./middlewares/rateLimiter";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { createLogger } from "./logger";
import { accessLogStream } from "./logger/morgan";
import fileUpload from "express-fileupload";

const app: express.Application = express();

const logger = createLogger("app", "app");
const runMode = config.get("env");

logger.info(`Application run mode: ${runMode}`);

/*
 * middleware
 */
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

if (runMode == "production") {
  app.use("/v1/auth", authLimiter);
}

app.use(fileUpload());
/*
 * route
 */

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "it's me" });
});

/**
 * it give server information to client
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

/*
 * Common Error
 */

//send 404 error for unknkow api request
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.error("NOT FOUND header:" + JSON.stringify(req.headers));
  logger.error("NOT FOUND param:" + JSON.stringify(req.param));
  logger.error("NOT FOUND body:" + JSON.stringify(req.body));
  next(new ApiError(httpStatus.NOT_FOUND, "RE01"));
});

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
