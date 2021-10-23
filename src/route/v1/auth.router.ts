import express from "express";
import { authSchema } from "../../validations";
import { authController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const authRouter = express.Router();

//request
authRouter.post(
  "/register",
  validate(authSchema.register),
  authController.register
);

//send verification email
authRouter.post(
  "/send-verification-email",
  validate(authSchema.sendVerificationEmail),
  auth,
  authController.sendVerificationEmail
);

//request send verrification email
authRouter.post(
  "/verify-email",
  validate(authSchema.verifyEmail),
  auth,
  authController.verifyEmail
);
//authRouter.post("/login", validate(authSchema.login), authController.login);
//authRouter.post("/logout", validate(authSchema.logout), authController.login);

//request send mail forgot id or password
authRouter.post(
  "/send-email-forgot",
  validate(authSchema.sendEmailForgot),
  authController.sendEmailForgot
);

//Login
authRouter.post("/login", validate(authSchema.login), authController.login);

authRouter.post("/logout", validate(authSchema.logout), authController.logout);

export default authRouter;
