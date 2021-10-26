/**
 * Error Code
 *
 * - A* : related auth
 * - M* : related model
 * - R* : related resource
 * - UNKNOW: ...
 */

const ERROR_CODE = {
  NOT_FOUND_USER:{
    error: "user-03",
    message: "user not exists",
    detail: "Ensure thar userid"
  },
  INCORRECT_USER_INFO: {
    error: "user-02",
    message: "user id or password is incorrect",
    detail: "Ensure thar userid, passowrd"
  },
  EXISTS_USER_ID: {
    error: "user-01",
    message: "user id exists",
    detail: "Ensure that the user id",
  },
  GROUP_NAME_EXISTS: {
    error: "group-01",
    message: "group name is exists",
    detail: "Ensure that the groupname",
  },
  AE01: "User id already exists",
  AE02: "Email already exists",
  AE03: "Please authenticate",
  AE04: "User not exists",
  ME01: "Model schema is invalid",
  REO1: "Resource is not found",
  GE01: "Group name already exists",
  TE01: "Topic name already exists",
  BE01: "Bot name or id already exists",
  FE01: "File service error",
  UNKNOWN: {
    error: "unknown-01",
    message: "unknown error",
    detail: "unknown error",
  },
  RESOURCE_NOT_FOUND: "Resource is not found",
};

export { ERROR_CODE };
