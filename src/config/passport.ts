import config from "config";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { tokenTypes } from "./token";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get<string>("jwt.secretKey"),
};

const jwtVerify = async (payload, done) => {
  console.log("jwtVerify", payload);
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }
    const user = { userObjectId: payload.sub }; //await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
export { jwtStrategy };
