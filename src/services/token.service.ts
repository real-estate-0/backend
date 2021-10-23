import config from "config";
import httpStatus from "http-status";
import moment from "moment";
import jwt from "jsonwebtoken";
import { tokenTypes } from "../config/token";
import { Token } from "../models";
import { ApiError } from "../utils/ApiError";
import Service from "./base.service";
import { createLogger } from "../logger";

const logger = createLogger("auth", "service");

class TokenService extends Service {
  generateToken = (userObjectId, expires, type) => {
    logger.debug(`[start] generateToken:${userObjectId} ${expires} ${type}`)
    const secret: string = config.get("jwt.secretKey");
    const payload = {
      sub: userObjectId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  };

  saveToken = async (token, userObjectId, expires, type, blacklisted = false) => {
    logger.debug(`[start] saveToken:${userObjectId} ${expires} ${type}`)
    return await Token.create({ token, userObjectId, expires, type, blacklisted });
  };

  verifyToken = async (token, type) => {
    logger.debug(`[start] verifyToken: ${token} ${type}`)
    const tokenDoc = await Token.isExists({ token: token, type: type });
    logger.debug(`token document: ${tokenDoc}`)
    if (tokenDoc) return true;
    throw new ApiError(httpStatus.UNAUTHORIZED, "AE03");
  };

  generateAuthTokens = async (userObjectId: string) => {
    logger.debug(`[start] generateAuthTokens: ${userObjectId}`)

    const accessTokenExpires = moment().add(
      config.get("jwt.accessExpireMinutes"),
      "minutes"
    );
    const accessToken = this.generateToken(
      userObjectId,
      accessTokenExpires,
      tokenTypes.ACCESS
    );

    const refreshTokenExpires = moment().add(
      config.get("jwt.refreshExpireDays"),
      "day"
    );
    const refreshToken = this.generateToken(
      userObjectId,
      refreshTokenExpires,
      tokenTypes.REFRESH
    );
    await this.saveToken(
      refreshToken,
      userObjectId,
      refreshTokenExpires,
      tokenTypes.REFRESH
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  };
  /**
   *
   * @param {IUser} user
   * @returns {IToken} token
   */

  generateVerifyEmailToken = async (user: IUser) => {
    const expires = moment().add(
      config.get("jwt.verifyEmailExpirationMinutes"),
      "minutes"
    );
    const verifyEmailToken = Math.floor(100000 + Math.random() * 900000);
    await this.saveToken(
      verifyEmailToken,
      String(user._id),
      expires,
      tokenTypes.VERIFY_EMAIL
    );
    return verifyEmailToken;
  };
}

//export { generateAuthTokens, generateVerifyEmailToken, verifyToken };

const tokenService = new TokenService();
export default tokenService;
