import Model from "./base.model";

class Token extends Model {
  constructor(){
    super("tokens");
    this.init();
  }

  create = async (token: any) => {
    // default value proper hard code?
    return await this.insertOne(token);
  };

  isExists = async (filter: object) => {
    console.log("isExists", filter);
    return await this.findOne(filter);
  }
}

const TokenModel = new Token();

export default TokenModel;

