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
    if (!passwordCompareResult) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "INCORRECT_USER_INFO");
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
