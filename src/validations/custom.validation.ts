const objectId = (value, helpers) => {
  console.log("objectId", value);
  if (!value.match(/^[0-9a-fA-F]{24}/)) {
    console.log("invalid", value);
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  console.log("valid", value);
  return value;
};

const password = (value, helpers) => {
  if (value.length < 6) {
    return helpers.message("password must be at least 6 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

export { objectId, password };
