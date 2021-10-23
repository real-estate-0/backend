import Joi from "joi";

const validate = (schema, object) => {
  if(schema && object){
    const { value, error } = Joi.compile(schema)
      .prefs({ errors: { label: "key" } })
      .validate(object);
    if(error) {
      return false
    }
    return true;
  }
  return false;
};

export { validate };
