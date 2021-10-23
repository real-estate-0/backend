/**
 * Error Code
 *
 * - A* : related auth
 * - M* : related model
 * - R* : related resource
 * - UNKNOW: ...
 */

const ERROR_CODE = {
  GROUP_NAME_EXISTS: {
    "error": "group-01",
    "message": "group name is exists",
    "detail": "Ensure that the groupname"
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
    "error": "unknown-01",
    "message": "unknown error",
    "detail": "unknown error",
  },
  RESOURCE_NOT_FOUND: "Resource is not found"
};

export { ERROR_CODE };
