import express, { Request, Response, NextFunction } from "express";
import config from "config";
import { catchAsync } from "./utils/catchAsync";
import { createServer, Server as HttpServer } from "http";
import { Server as IoServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { configSchema } from "./validations/config.validation";
import { MongoConnector } from "./connector/mongo";
import { validate } from "./middlewares/validate";
import { workerSchema } from "./validations";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import xss from "xss-clean";
import passport from "passport";
import routes from "./route/v1";
import { ApiError } from "./utils/ApiError";
import { jwtStrategy } from "./config/passport";
import { authLimiter } from "./middlewares/rateLimiter";
import httpStatus from "http-status";
import { createLogger } from "./logger";
import { accessLogStream } from "./logger/morgan";

import Redis from "ioredis";
/**
 * Enviroment check
 * - config setting
 * - license checking
 * - port checking
 */
const logger = createLogger("socket", "socket");

const runMode = config.get("env");

logger.info(`Application run mode: ${runMode}`);

class SocketServer {
  private readonly app: express.Application;
  private httpServer: HttpServer;
  private PORT: number;
  private io: IoServer;
  private redis: any;

  constructor() {
    this.loadConfiguration();
    this.setDefaultHandler();
    this.connectDb();

    this.app = express();
    this.initializeApp();
    this.initailizeSocket();
    this.registerSocketEvent();
  }

  private loadConfiguration() {
    this.PORT = Number(process.env.PORT); //config.get("server.api.port");
  }

  public getApp() {
    return this.app;
  }

  public getSocket() {
    return this.io;
  }

  private initializeApp() {
    /*
     * middleware
     */
    logger.info("initailizeApp start");
    this.app.use(morgan("combined", { stream: accessLogStream }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());

    //enable cors
    this.app.use(cors());

    this.app.get("/ping", (req: Request, res: Response) => {
      res.status(202).json({ message: "it's me" });
    });

    this.app.post("/worker/message", this.handleWorkerMessage);
    logger.info("initailizeAppfinish");

    this.httpServer = createServer(this.app);
  }

  private handleWorkerMessage = catchAsync(
    async (req: Request, res: Response) => {
      const packet: TWorkerMessage = req.body as any;
      console.log("workerMessage packet", packet);
      if (packet.sendType == "broadcast") {
        const target = packet["target"];

        this.io.to(target).emit("test", { data: 1 });
      }
      if (packet.sendType == "global") {
      }
      res.status(httpStatus.ACCEPTED).send();
    }
  );

  private initailizeSocket() {
    logger.info("initailizeSocket start");
    try {
      if (!this.httpServer) throw Error("not initailize http-server");
      const redisInfo = config.get("redis.socket");
      this.io = new IoServer(this.httpServer);
      const pubClient = new Redis({
        host: redisInfo["host"],
        port: redisInfo["port"],
        password: redisInfo["password"],
      });
      const subClient = pubClient.duplicate();
      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info("initailizeSocket finish");
    } catch (err) {
      console.log("err", err);
    }
  }

  private registerSocketEvent() {
    if (!this.io) throw Error("not initailize socket");

    /*
    this.socket.use((socket, next) =>{
      const userObjectId= socket.handshake.auth.userObjectId
      console.log('socket accessToken', userObjectId);
      if(!userObjectId){
        return next(new Error('invalid accesstoken'))
      }
      //socket.username = username;
      next();
    })
    */

    /**
     * Socket Event
     */

    this.io.on("connection", (socket) => {
      console.log("connected", socket.handshake.auth, socket.handshake.query);
      if (!socket.handshake.auth) {
        console.log("not proper auth it will be disconnect");
        socket.disconnect();
      }

      socket.on("message", (data) => {
        console.log(data);
      });

      socket.on("disconnect", (data) => {
        console.log("disconnect", data);
      });

      socket.on("join-room", (data) => {
        console.log("join-room", data);
        if (data.roomId) {
          socket.join(data.roomId);
        }
      });

      socket.on("leave-room", (data) => {
        console.log("leave-room", data);
        if (data.roomId) {
          socket.leave(data.roomId);
        }
      });
      /*
       * Broadcast message processing
       */

      socket.on("broadcast", (data: BroadcastData) => {
        console.log("received broadcast", data);
        if (data.isGlobal) {
          console.log("all client emit", data);
          this.io.emit(data as any);
        } else {
          console.log("channel client emit", data.channel, data);
          socket.to(data.channel).emit(data.event, data as any);
        }
      });
    });

    this.io.of("/").adapter.on("create-room", (room) => {
      console.log(`room ${room} was created`);
    });

    this.io.of("/").adapter.on("join-room", (room, id) => {
      console.log(`socket ${id} has joined room ${room}`);
    });

    this.io.of("/").adapter.on("leave-room", (room) => {
      console.log(`room ${room} was leave`);
    });

    this.io.of("/").adapter.on("delete-room", (room) => {
      console.log(`socket  has deleted room ${room}`);
    });
  }

  private async connectDb() {
    await MongoConnector.connect();
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
    this.httpServer.listen(this.PORT, () => {
      logger.info(`Server port listen: ${this.PORT}`);
    });
  }
}

const socketServer = new SocketServer();
socketServer.run();
