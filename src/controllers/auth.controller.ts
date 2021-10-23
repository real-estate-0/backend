import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { authService, userService, tokenService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "auth.controller");

class AuthController extends Controller {
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
