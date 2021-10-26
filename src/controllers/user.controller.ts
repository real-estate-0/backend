import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { userService } from "../services";
import { createLogger } from "../logger";
import { ApiError } from "../utils/ApiError";
import Controller from "./base.controller";

const logger = createLogger("controller", "user.controller");

class UserController extends Controller {
  createUser = catchAsync(async (req, res) => {
    console.log("createUser", JSON.stringify(req.body));
    const user = await userService.createUser(req.body);
    console.log("user", user);
    res.status(httpStatus.CREATED).send({ result: { user: user } });
  });
  /**
   * @returns {ResultForm} {result: IUser[]}
   */
  getUsers = catchAsync(async (req, res) => {
    console.log("getUsers", req.query);
    const users = await userService.getUsers();
    res.status(httpStatus.OK).send({ result: { users: users } });
  });

  updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(
      req.params.userObjectId,
      req.body
    );
    console.log("updated user", user);
    res.status(httpStatus.OK).send({ result: { user: user } });
  });

  deleteUser = catchAsync(async (req, res) => {
    const user = await userService.deleteUser(req.params.userObjectId);
    res.status(httpStatus.OK).send();
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
