import { ApiError } from "../utils/ApiError";
import { ObjectID } from "bson";
import { User } from "../models";
import httpStatus from "http-status";
import Service from "./base.service";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("user", "service");

class UserService extends Service {
  constructor() {
    super();
  }

  createUser = async (userData: IUser) => {
    logger.debug(`[start] createUser: ${userData}`);
    // default value proper hard code?
    //FIX
    if (await User.isUserIdExists(userData.userId)) {
      throw new ApiError(httpStatus.CONFLICT, "EXISTS_USER_ID");
    }
    return await User.create(userData);
  };

  updateUser = async (userObjectId: string, userInfo: IUser) => {
    if (userInfo.password) {
      console.log("will update user password");
      await User.updatePassword(userObjectId, userInfo.password);
      delete userInfo["password"];
    }
    console.log("will update user", userObjectId, userInfo);
    return await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $set: { ...userInfo } }
    );
  };

  getUsers = async () => {
    return await User.find({}, []);
  };

  getUserByUserId = async <T>(userId: string): Promise<T> => {
    const user = await User.findOne<T>({
      userId: userId,
    });
  
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "NOT_FOUND_USER");
    }
    return user;
  };

  deleteUser = async (userObjectId: string) => {
    return await User.deleteOne({ _id: new ObjectID(userObjectId) });
  };
}

const userService = new UserService();
export default userService;
