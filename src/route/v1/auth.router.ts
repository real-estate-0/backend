import express from "express";
import { authSchema } from "../../validations";
import { authController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const authRouter = express.Router();
//Login
authRouter.post("/login", validate(authSchema.login), authController.login);

authRouter.post("/logout", validate(authSchema.logout), authController.logout);

export default authRouter;
