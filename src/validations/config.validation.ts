import Joi from "joi";

/*
 * config file validation
 */
const configSchema = Joi.object({
  env: Joi.any().allow("production", "development", "test"),
  //file storage path
  file_path: Joi.object({
    bot: Joi.string().required(),
    topic: Joi.string().required(),
    group: Joi.string().required(),
    user: Joi.string().required(),
  }),
  ssl: Joi.object({
    enable: Joi.boolean(),
    key: Joi.string(),
    cert: Joi.string(),
  }),
  api: Joi.object({
    bot: Joi.object({
      port: Joi.number(),
    }),
  }),
  socket: Joi.object({
    url: Joi.string(),
  }),
  timeZone: Joi.string().required(),
  log: Joi.object({
    path: Joi.string().required(),
    maxFiles: Joi.string().required(),
    maxSize: Joi.string().required(),
    level: Joi.any().allow("debug", "info", "error", "warn", "verbose"),
  }),
  jwt: Joi.object({
    secretKey: Joi.string().required(),
    accessExpireMinutes: Joi.number().required(),
    refreshExpireDays: Joi.number().required(),
    verifyEmailExpirationMinutes: Joi.number().required(),
  }),
  mongodb: Joi.object({
    url: Joi.string().required(),
    dbName: Joi.string().required(),
  }),
  redis: Joi.object({
    auth: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().required(),
      password: Joi.string(),
    }),
    app: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().required(),
      password: Joi.string(),
    }),
    socket: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().required(),
      password: Joi.string(),
    }),
    queue: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().required(),
      password: Joi.string(),
    }),
  }),
});

export { configSchema };
