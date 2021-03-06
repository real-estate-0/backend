import express from "express";
import config from "config";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import reportRouter from "./report.router";
import dataRouter from "./data.router";
import tagRouter from "./tag.router";
//import mailRouter from "./mail.router";
//import { topicRouter } from "./topic.router";

/*
 * Base Resource
 */

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/users",
    route: userRouter,
  },
  {
    path: "/reports",
    route: reportRouter,
  },
  {
    path: "/data",
    route: dataRouter,
  },
  {
    path: "/tags",
    route: tagRouter,
  },
];

const devRoutes = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.get("env") === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
