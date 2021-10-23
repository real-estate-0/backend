import { NextFunction, Request, Response } from 'express';
import passport from "passport";
import { ApiError } from "../utils/ApiError";

import httpStatus from "http-status";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  console.log("auth body", req.headers, req.body);
  if(process.env.NODE_ENV === 'development') return next();
  return passport.authenticate("jwt", { session: false }, (error, user) => {
    if (user) {
      console.log("auth user", user);
      req.user = user;
    } else {
      next(new ApiError(httpStatus.UNAUTHORIZED, "AE03"));
    }
    next();
  })(req, res, next);
};

export default  auth;
