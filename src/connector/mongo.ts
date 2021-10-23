import config from "config";
import { Db, MongoClient } from "mongodb";

type MongoConf = {
  url: string;
  dbName: string;
};

class MongoConnector {
  static _db: Db;
  static _client: MongoClient;

  static connect = async () => {
    if (MongoConnector._db) return;
    const mongoConf: MongoConf = config.get("mongodb");
    console.log("url", mongoConf.url);

    MongoConnector._client = new MongoClient(mongoConf.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      await MongoConnector._client.connect();
      MongoConnector._db = MongoConnector._client.db(mongoConf.dbName);
      console.log("successfully connected database");
    } catch (err) {
      console.log(err.stack);
    }
  };

  static getDb = async (): Promise<Db> => {
    console.log("get db", MongoConnector._db);
    if (!MongoConnector._db) {
      console.log("try connect to db");
      await MongoConnector.connect();
    }
    return MongoConnector._db;
  };
  static getClient = (): MongoClient => {
    return MongoConnector._client;
  };
  static isConnected = () => {
    return MongoConnector._client.isConnected();
  };
}

export { MongoConnector };
