import express from "express";
import { userSchema } from "../../validations";
import { userController } from "../../controllers";
import { auth, validate } from "../../middlewares";

const userRouter = express.Router();

/*
 * User resource
 */
userRouter
  .route("/")
  .get(validate(userSchema.getUsers), userController.getUsers)
  .post(validate(userSchema.createUser), userController.createUser);

userRouter
  .route("/:userObjectId")
  .put(validate(userSchema.updateUser), userController.updateUser)
  .delete(validate(userSchema.deleteUser), userController.deleteUser);

export default userRouter;
