import express from "express";
import config from "config";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import topicRouter from "./topic.router";
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
