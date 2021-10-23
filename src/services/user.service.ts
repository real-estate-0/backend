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
    if (await User.isEmailExists(userData.email)) {
      throw new ApiError(httpStatus.CONFLICT, "AE02");
    }
    return await User.create(userData);
  };

  appendGroup = async (userObjectId: string, groupObjectId: string) => {
    return await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $addToSet: { joinedGroups: groupObjectId } }
    );
  };

  pullGroup = async (userObjectId: string, groupObjectId: string) => {
    return await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $pull: { joinedGroups: groupObjectId } }
    );
  };

  createJoinRequest = async (userObjectId: string, groupObjectId: string) => {
    return await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $addToSet: { joinRequest: groupObjectId } }
    );
  };

  deleteJoinRequest = async (userObjectId: string, groupObjectId: string) => {
    return await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $pull: { joinRequest: groupObjectId } }
    );
  };

  isUserIdExists = async (userId: string): Promise<boolean> => {
    console.log("userId", userId);
    return await User.isUserIdExists(userId);
  };

  isEmailExists = async (email: string): Promise<boolean> => {
    return await User.isEmailExists(email);
  };

  verifiedEmailByUserId = (userId: string): void => {
    const result = User.updateOne(
      { userId: userId },
      {
        $set: {
          verifiedEmail: true,
        },
      }
    );
  };

  getUserIdByEmail = async (email: string): Promise<string> => {
    const doc = await User.findOne<IUser>({ email: email });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return doc.userId;
  };

  updatePassword = async (userObjectId: string, password: string) => {
    return await User.updatePassword(userObjectId, password);
  };

  comparePassword = async (userObjectId: string, password: string) => {
    return await User.comparePassword(userObjectId, password);
  };

  comparePasswordByUserId = async (userObjectId: string, password: string) => {
    return await User.comparePassword(userObjectId, password);
  };
  /*
  getUserPassword = async (userId: string) => {
    const db: any = MongoConnector.getDb(); //await getConnection();
    const userDoc = await db
      .collection(collectionName)
      .findOne({ userId: userId });
    console.log("getUserPassword", userDoc.password);
    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc.password;
  };
  */
  /**
   * Get users
   */
  getUsers = async () => {
    return await User.find({});
  };

  /*
  getUserById = async (userId: string) => {
    let userDoc = await db
      .collection(collectionName)
      .findOne({ userId: userId });
    console.log("model getUserById", userDoc);

    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc;
  };
  */

  getUserByObjectId = async <T>(userObjectId: string): Promise<T> => {
    const userDoc = await User.findById<T>(userObjectId);
    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc;
  };

  getUsersByObjectIds = async <T>(userObjectIds: string[]): Promise<T[]> => {
    const users = await User.findByIds<T>(userObjectIds);
    return users;
  };

  getUserByUserId = async <T>(userId: string): Promise<T> => {
    const userDoc = await User.findOne<T>({ userId: userId });
    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc;
  };

  appendTopic = async (userObjectId: string, topicObjectId: string) => {
    logger.debug(
      `[start] appendTopic user:${userObjectId} topic:${topicObjectId}`
    );
    const userDoc = await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $addToSet: { topics: topicObjectId } }
    );
    logger.debug(`[result] userDoc:${userDoc}`);
    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc;
  };

  pullTopic = async (userObjectId: string, topicObjectId: string) => {
    const userDoc = await User.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $pull: { topics: topicObjectId } }
    );
    if (!userDoc) throw new ApiError(httpStatus.NOT_FOUND, "AE04");
    return userDoc;
  };
}

const userService = new UserService();
export default userService;
