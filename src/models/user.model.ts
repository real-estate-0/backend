import { ObjectID } from "bson";
import Model from "./base.model";
import bcrypt from "bcrypt";
import { createLogger } from "../logger";

const logger = createLogger("user", "models");

/**
 * Unique index
 * - userId,
 * - email
 */

class User extends Model {
  private userDefault: IUser = {
    userId: null,
    userName: null,
    password: null,
    email: null,
    termsConfirm: null,
    role: null,
    verifiedEmail: null,
    joinedGroups: [],
    topics: [],
    createdTime: null,
    settings: {},
    joinRequest: [],
  };

  constructor() {
    super("users");
    console.log("User Constructor");
    this.init();
  }

  /**
   * @returns {IUser} userif insert successed
   */
  create = async (userData: IUser): Promise<IUser> => {
    // default value proper hard code?
    userData.role = "user";
    userData.verifiedEmail = false;
    userData.joinedGroups = [];
    userData.password = await bcrypt.hash(userData.password, 8);
    const data = { ...this.userDefault, ...userData };

    const doc = await this.insertOne(data);

    delete doc["password"];
    return doc;
  };

  /**
   * @returns {boolean} true if userId exists else false
   */
  isUserIdExists = async (userId: string) => {
    const user = await this.findOne({ userId: userId });
    if (user) return true;
    return false;
  };

  /**
   * @returns {boolean} true if emailexists else false
   */
  isEmailExists = async (email: string) => {
    logger.debug(`[start] isEmailExists ${email}`);
    const user = await this.findOne({ email: email });
    logger.debug(`user info ${user}`);
    if (user) return true;
    return false;
  };

  async updatePassword(
    userObjectId: string,
    password: string
  ): Promise<boolean> {
    const hashPassword = await bcrypt.hash(password, 8);
    const result = await this.updateOne(
      { _id: new ObjectID(userObjectId) },
      { $set: { password: hashPassword } }
    );
    if (result) return true;
    return false;
  }
  /**
   * @param {string} topicObjectId
   * @returns {boolean} is password corrected?
   */
  async comparePassword(
    userObjectId: string,
    password: string
  ): Promise<boolean> {
    const user = await this.findOne<IUser>({ _id: new ObjectID(userObjectId) });
    if ("password" in user) {
      const encPassword = user["password"];
      return await bcrypt.compare(password, encPassword);
    }
    return false;
  }
}

const UserModel = new User();
export default UserModel;
