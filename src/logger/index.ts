import path from "path";
import config from "config";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import moment from "moment-timezone";

const enumerateErrorFormat = winston.format(
  (info: winston.Logform.TransformableInfo) => {
    if (info instanceof Error) {
      Object.assign(info, { message: info.stack });
    }
    return info;
  }
);

const localTime = winston.format((info, opts) => {
  if (opts.tz) info.timestamp = moment().tz(opts.tz).format();
  return info;
});

/*
 * it can create logger
 * log path should be written in config log.path
 *
 * @param {string} loggerName - logger name
 * @param {string} fileName - it will be write to file name
 * @returns {Winston logger}
 */
export function createLogger(
  loggerName: string,
  fileName: string
): winston.Logger {
  //const fullPath = path.join(config.get('log.path'), fileName)
  const env = config.get("env");
  const timeZone = config.get("timeZone");
  const dir = path.join(config.get("log.path"));
  const maxSize: string = config.get("log.maxSize");
  const logFileCount: string = config.get("log.maxFiles");
  const level: string = config.get("log.level");

  const formatter = winston.format.combine(
    enumerateErrorFormat(),
    winston.format.label({ label: loggerName }),
    localTime({ tz: timeZone }),
    env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(
      ({ label, timestamp, level, message }) =>
        `${timestamp} ${level} [${label}]: ${message}`
    )
  );

  const logger = winston.createLogger({
    level: level, //env === "development" ? "debug" : "info",
    format: formatter,
    transports: [
      new winston.transports.Console(),
      /*
      new DailyRotateFile({
        dirname: dir,
        filename: fileName + "-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: maxSize,
        maxFiles: logFileCount,
      }),
      */
    ],
  });

  if (env !== "production") {
    logger.add(
      new winston.transports.Console({
        level: "debug",
        format: formatter,
      })
    );
  }
  return logger;
}
