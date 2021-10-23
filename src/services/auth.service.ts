import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError";
import { Token } from "../models";
import { tokenTypes } from "../config/token";
import { userService } from "./index";
import { tokenService } from "./index";
import Service from "./base.service";
import bcrypt from "bcrypt";
import config from "config";
import { createLogger } from "../logger";

const logger = createLogger("auth", "service");

class AuthService extends Service {

  register = async (req, res) => {
    logger.debug(`[start] register: ${req.body}`);
    const user = await userService.createUser(req.body);
    logger.debug(`user document: ${user}`);
    const tokens = await tokenService.generateAuthTokens(String(user._id));
  };

  verifyEmail = async (userId: string, token: string) => {
    console.log("verifyEmail", userId, token);
    const isValidToken = await tokenService.verifyToken(
      parseInt(token),
      tokenTypes.VERIFY_EMAIL
    );
    if (isValidToken) {
      userService.verifiedEmailByUserId(userId);
      return true;
    }
  };

  /**
   * generate tempPassword
   * @param {string} userId
   * @return {string} password (no encrypted)
   */
  generateTempPasswordWithSave = async (userId: string) => {
    const password = Math.random().toString(36).slice(-8);
    userService.updatePassword(userId, password);
    return password;
  };

  /**
   *
   */

  comparePassword = async (password, origin) => {
    return bcrypt.compare(password, origin);
  };

  /**
   *
   * @param userId
   * @param password
   * @returns {object} User: IUser
   */
  login = async (userId: string, password: string): Promise<IUser> => {
    console.log("service", userId, password);
    const user = await userService.getUserByUserId<IUser>(userId);
    console.log("service user", user);
    const passwordCompareResult = await this.comparePassword(
      password,
      user.password
    );
    console.log("login result", user, passwordCompareResult);
    //개발
    if (config.get("env") != "development" && !passwordCompareResult) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "AE03");
    }
    return user;
  };
  /**
   * Logout
   * @param {string} refreshToken
   * @returns {Promise}
   */
  logout = async (refreshToken: string) => {
    const refreshTokenDoc = await Token.findOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, "Not found");
    }
    await Token.deleteOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
  };
}

//export { register, verifyEmail, generateTempPasswordWithSave, login };
const authService = new AuthService();
export default authService;
