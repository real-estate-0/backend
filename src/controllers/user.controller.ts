import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import {
  userService,
} from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "user.controller");

class UserController extends Controller {
  /**
   * @returns {ResultForm} {result: IUser}
   */
  getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserByObjectId(req.params.userObjectId);
    res.status(httpStatus.OK).send({ result: user });
  });

  /**
   * @returns {ResultForm} {result: IUser[]}
   */
  getUsers = catchAsync(async (req, res) => {
    const user = await userService.getUsers();
    res.status(httpStatus.OK).send({ result: user });
  });

  /**
   *
   */
  getUserGroups = catchAsync(async (req, res) => {
    const user = await userService.getUserByObjectId<IUser>(
      req.params.userObjectId
    );
    //const groups = await groupService.getGroupsByObjectIds(user.joinedGroups);
    res.status(httpStatus.OK).send({ });
  });

  /**
   * @returns {ResultForm} {}
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.userObjectId, req.body);
  res.status(httpStatus.OK).send()
});


const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.deleteUser(req.params.userObjectId);
  res.status(httpStatus.OK).send()
});
*/

  getUserMemos = catchAsync(async (req, res) => {
    logger.debug(`[start]: {req.params.userObjectId}`);
    //const memos = await memoService.getUserMemos(req.params.userObjectId);
    logger.debug(`[start]: {memos}`);
    res.status(httpStatus.OK).send({ });
  });
}

const userController = new UserController();

export default userController;
/*
export {
  getUser,
  getUsers,
  //updateUser,
  //deleteUser,
  getUserMemos,
  getUserMemo,
  createUserMemo,
  updateUserMemo,
  deleteUserMemo,
};
*/
