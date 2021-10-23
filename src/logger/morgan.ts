import config from "config";
import * as rfs from "rotating-file-stream";
//var rfs = require('rotating-file-stream');

//morgan.token('message', (req, res) => res.locals.errorMessage || '');

const dir: string = config.get("log.path");
const maxSize: string = config.get("log.maxSize");

//export const accessLogStream = fs.createWriteStream(path.join(dir, 'access.log'), { flags: 'a'})

export const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  size: maxSize.toUpperCase(),
  path: dir,
  compress: true,
});
