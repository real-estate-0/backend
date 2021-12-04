import express, { Request, Response, NextFunction } from "express";
import config from "config";
import { catchAsync } from "./utils/catchAsync";
import { createServer } from "http";
import { configSchema } from "./validations/config.validation";
import { MongoConnector } from "./connector/mongo";
//import { app } from "./app";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import routes from "./route/v1";
import { ApiError } from "./utils/ApiError";
import { jwtStrategy } from "./config/passport";
import httpStatus from "http-status";
import { createLogger } from "./logger";
import { accessLogStream } from "./logger/morgan";
import proxy from "html2canvas-proxy";

/**
 * Enviroment check
 * - config setting
 * - license checking
 * - port checking
 */
const logger = createLogger("server", "server");

const runMode = config.get("env");

logger.info(`Application run mode: ${runMode}`);

class AppServer {
  private readonly app: express.Application;
  private appServer;
  private PORT: number;
  private socket: any;

  constructor() {
    this.connectDb();
    this.app = express();
    this.initializeApp();
    this.loadConfiguration();
    this.appServer = createServer(this.app);
  }

  public getApp() {
    return this.app;
  }

  private initializeApp() {
    /*
     * middleware
     */
    this.app.use(morgan("combined", { stream: accessLogStream }));
    this.app.use(express.urlencoded({ limit: "14mb", extended: false }));
    this.app.use(express.json({ limit: "14mb" }));

    //error handler
    //app.use(errorConverter);
    //xss
    //this.app.use(xss());

    // gzip compression
    this.app.use(compression());

    //enable cors
    this.app.use(cors());

    //jwt authentcation
    passport.use(jwtStrategy);
    this.app.use(passport.initialize());

    /*
     * route
     */
    this.app.use("/capture", proxy());
    this.app.get("/", (req: Request, res: Response) => {
      res.status(202).json({ message: "it's me" });
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

    this.app.use("/api/v1", routes);

    /*
     * Common Error
     */

    //send 404 error for unknkow api request
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.error("NOT FOUND header:" + JSON.stringify(req.headers));
      logger.error("NOT FOUND param:" + JSON.stringify(req.param));
      logger.error("NOT FOUND body:" + JSON.stringify(req.body));
      next(new ApiError(httpStatus.NOT_FOUND, "RE01"));
    });

    this.app.use((error, req, res, next) => {
      logger.error("error handler:" + JSON.stringify(error));
      if (error) {
        return res.status(error.statusCode).json(error.errorResponse);
      }
      return res.status(500);
    });
  }

  private async connectDb() {
    await MongoConnector.connect();
  }

  private loadConfiguration() {
    this.PORT = Number(process.env.PORT || 4000); //config.get("server.api.port");
  }

  /*
   * register process default handler
   * - uncaughtException:
   * - unhandleRejection:
   * @returns {void}
   */
  private setDefaultHandler() {
    process.on("uncaughtException", (error) => {
      logger.error("uncaughed exception:" + JSON.stringify(error));
    });

    process.on("unhandledRejection", (error) => {
      logger.error("unhandled rejection:" + JSON.stringify(error));
    });
  }

  /*
   * Server run method
   */
  public run() {
    this.appServer.listen(this.PORT, () => {
      logger.info(`Server port: ${this.PORT}`);
    });
  }
}

const appServer = new AppServer();
appServer.run();

//export default AppServer;
