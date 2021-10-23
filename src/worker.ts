import express, { Request, Response, NextFunction } from "express";
import config from "config";
import { catchAsync } from "./utils/catchAsync";
import { Server, Socket } from "socket.io";
import { createLogger } from "./logger";
import { Queue } from "./queue";
import { Broadcast, Hook } from "./processing";
import { io } from "socket.io-client";

import {
  broadcastDataSchema,
  hookDataSchema,
} from "./validations/worker.validation";

import { validate } from "./utils/validate";

import Redis from "ioredis";
/**
 * Enviroment check
 * - config setting
 * - license checking
 * - port checking
 */
const logger = createLogger("worker", "worker");

const runMode = config.get("env");

logger.info(`Application run mode: ${runMode}`);

/*
 * Workershould have a socket connection
 *
 */

class Worker {
  WAIT_TIME: number = 1;
  private socket: any;
  private redis;

  constructor() {
    //this.initailizeSocket()
    this.createRedis();
    this.initailizeSocket();
  }

  private createRedis() {
    const redisInfo = config.get("redis.socket");
    this.redis = new Redis({
      host: redisInfo["host"],
      port: redisInfo["port"],
      password: redisInfo["password"],
    });
  }

  private initailizeSocket() {
    const socketUrl = config.get("socket.url");
    //console.log("socketUrl", socketUrl);
    try {
      this.socket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token: "123" },
        query: { "mey-key": "my-value" },
      });

      //console.log("emitted", this.socket);
    } catch (err) {
      //console.log("socketerror", err);
    }
  }

  /*
   * Server run method
   */
  public async run() {
    let count = 0;
    const queue = new Queue("broadcast");

    while (true) {
      try {
        queue.setQueue("broadcast");
        const broadcastData = await queue.pop<BroadcastData>();
        //console.log("poped broad", broadcastData);
        if (broadcastData) {
          if (validate(broadcastDataSchema, broadcastData)) {
            //logger.debug("boadcast run:" + JSON.stringify(broadcastData));
            const broadcast = new Broadcast();
            broadcast.run([this.socket, broadcastData]);
          } else {
            logger.debug(
              "boadcast data valid fail:" + JSON.stringify(broadcastData)
            );
          }
        }
        queue.setQueue("hook");
         
        /*
        await queue.push(
          { key: "hook"+count,
            url: "http://www.naver.com",
            method: "get"
          }
        )
        */
        const hookData = await queue.pop<HookData>();
        console.log("poped hook", hookData);
        if (hookData) {
          if (validate(hookDataSchema, hookData)) {
            const hook = new Hook();
            const result = await hook.run([hookData]);
            logger.debug('hook result:'+JSON.stringify(result));
          }else{
            logger.debug(
              "hook data valid fail:" + JSON.stringify(hookData)
            );
          }
        }

        queue.setQueue("temp");
        await queue.pop();
        count++;
        //queue.push({ data: 'test hook'+count })
      } catch (err) {
        console.log("err", err);
      } //try
    } //while
  }
}

process.on("SIGINT", function () {
  logger.info("catch sigint process will be exit");
  process.exit();
});

process.on("uncaughtException", (error) => {
  logger.error("uncaughed exception:" + JSON.stringify(error));
});

process.on("unhandledRejection", (error) => {
  logger.error("unhandled rejection:" + JSON.stringify(error));
});

setTimeout(() => {
  const worker = new Worker();
  logger.info("worker will start");
  worker.run();
}, 1000);
