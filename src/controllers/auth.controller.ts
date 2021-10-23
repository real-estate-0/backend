import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import {
  authService,
  userService,
  tokenService,
} from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "auth.controller");

class AuthController extends Controller {
  register = catchAsync(async (req: Request, res: Response) => {
    logger.info("[entry] register:" + JSON.stringify(req.body));
    const user = await userService.createUser(req.body);
    logger.info("createUser:" + JSON.stringify(user));
    const tokens = await tokenService.generateAuthTokens(user._id);
    logger.info("tokens:" + JSON.stringify(tokens));
    res.status(httpStatus.CREATED).send({ user, tokens });
  });

  sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
    logger.info("[entry] sendVerificationEmail:" + JSON.stringify(req.body));
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(
      req.user
    );
    logger.info("generateVerifyEmailToken:" + JSON.stringify(verifyEmailToken));
    //await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
    res.status(httpStatus.NO_CONTENT).send();
  });

  verifyEmail = catchAsync(async (req, res) => {
    logger.info("[entry] verifyEmail:" + JSON.stringify(req.body));
    const isExists = await authService.verifyEmail(
      req.user.userId,
      req.body.token
    );
    logger.info("[result] verifyEmail:" + JSON.stringify(isExists));
    if (isExists) res.status(httpStatus.NO_CONTENT).send();
  });

  sendForgotIdEmail = catchAsync(async (req, res) => {
    const userId = await userService.getUserIdByEmail(req.body.email);
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    //emailService.sendForgotIdEmail(req.body.email, userId);
    res.status(httpStatus.NO_CONTENT).send();
  });

  sendEmailForgot = catchAsync(async (req, res) => {
    const userId = await userService.getUserIdByEmail(req.body.email);
    console.log("sendEmailForgot req", req.body);
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND, "AE04");

    if (req.body.type == "id") {
      //emailService.sendForgotIdEmail(req.body.email, userId);
    } else if (req.body.type == "password") {
      const tempPassword = await authService.generateTempPasswordWithSave(
        userId
      );
      console.log("tempPassword", tempPassword);
      //emailService.sendTempPasswordEmail(req.body.email, tempPassword);
    }
    console.log("sendEmailForgot completed");
    res.status(httpStatus.NO_CONTENT).send();
  });

  login = catchAsync(async (req, res) => {
    const { userId, password } = req.body;
    console.log("login cotroller", userId, password);
    const user = await authService.login(userId, password);
    const tokens = await tokenService.generateAuthTokens(user._id);
    console.log("login controller", user, tokens);
    res.status(httpStatus.OK).send({ userObjectId: user._id, tokens });
  });

  logout = catchAsync(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  });
}

const authController = new AuthController();

export default authController;
/*
export {
  register,
  sendForgotIdEmail,
  sendEmailForgot,
  sendVerificationEmail,
  verifyEmail,
  login,
};
*/
