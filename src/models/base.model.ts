import { Db } from "mongodb";
import { ObjectID } from "bson";
import { MongoConnector } from "../connector/mongo";
import { createLogger } from "../logger";
const logger = createLogger("base.model", "models");

abstract class Model {
  protected db: Db;
  protected isConnected: boolean;
  protected collectionName: string;

  constructor(collectionName: string) {
    logger.debug("[start] constructor:" + collectionName);
    this.collectionName = collectionName;
  }

  init = async () => {
    logger.debug("[start] init");
    this.db = await MongoConnector.getDb();
    this.isConnected = MongoConnector.isConnected();
    logger.debug(`[end] init: databaseconnected result -> ${this.isConnected}`);
  };

  async findOne<T>(
    query: Record<string, unknown>,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug("[start] findOne:" + JSON.stringify(query));
    logger.debug("query to " + collectionName);
    const result = await this.db.collection(collectionName).findOne(query);
    logger.debug("[end] findOne result ok");
    if (!result) return null;
    return result;
  }

  async find<T>(
    query: Record<string, unknown>,
    fields: string[],
    collectionName: string = this.collectionName
  ): Promise<T[]> {
    logger.debug(`[start] find:${collectionName}` + JSON.stringify(query));

    let projection = {};
    for (let i = 0; i < fields.length; i++) {
      projection[fields[i]] = 1;
    }

    console.log("projection", projection);
    try {
      const result = await this.db
        .collection(collectionName)
        .find(query, { projection: projection })
        .toArray();
      logger.debug("[end] find:" + result.length);
      return result;
    } catch (err) {
      console.log("find error", err);
    }
  }

  async findById<T>(
    objectId: string,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug("[start] findById:" + JSON.stringify(objectId));
    const result = await this.db
      .collection(collectionName)
      .findOne({ _id: new ObjectID(objectId) });
    logger.debug("[end] findById: ok");
    return result;
  }

  async findByIds<T>(
    objectIds: string[],
    fields = [],
    key = "_id",
    collectionName: string = this.collectionName
  ): Promise<T[]> {
    logger.debug(`[start] findByIds: ${JSON.stringify(objectIds)}`);
    let projection = { password: 0 };
    for (let i = 0; i < fields.length; i++) {
      projection[fields[i]] = 0;
    }
    const ids =
      key == "_id"
        ? objectIds.map((_id: string) => new ObjectID(_id))
        : objectIds;
    logger.debug(
      `[params] collection: ${
        this.collectionName
      } findByIds:${key} ids:${JSON.stringify(ids)}`
    );

    const result = await this.db
      .collection(collectionName)
      .find({ [key]: { $in: ids } }, { projection })
      .toArray();
    logger.debug(`[end] findByIds: ${result} `);
    return result;
  }

  async insertOne(
    data: Record<string, unknown>,
    collectionName: string = this.collectionName
  ): Promise<any> {
    //logger.debug("[start] base insertOne:" + JSON.stringify(data));
    logger.debug("insertOne collectionName:" + collectionName);

    const result = await this.db.collection(collectionName).insertOne(data);
    //console.log("insertOne", result);
    logger.debug("[end] insertOne:" + JSON.stringify(result.ops));
    return result.ops[0];
  }

  async updateOne<T>(
    filter: Record<string, unknown>,
    operation: Record<string, unknown>,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug("[start] updateOne:" + JSON.stringify(filter));
    let result = await this.db
      .collection(collectionName)
      .findOneAndUpdate(filter, operation, {
        returnDocument: "after",
        projection: { password: 0 },
      });
    logger.debug("[end] updateOne:");
    return result.value;
  }

  async append(
    filter: Record<string, unknown>,
    field: string,
    data: any,
    collectionName: string = this.collectionName
  ): Promise<any> {
    logger.debug(
      "[start] append:" +
        JSON.stringify(filter) +
        ", field:" +
        JSON.stringify(field) +
        ", data:" +
        JSON.stringify(data)
    );
    const result = await this.db
      .collection(collectionName)
      .findOneAndUpdate(filter, "$addToSet", { returnDocument: "after" });
    logger.debug("[end] append:" + JSON.stringify(result));
    return result.value;
  }

  async pull(
    filter: Record<string, unknown>,
    field: string,
    data: any,
    collectionName: string = this.collectionName
  ): Promise<any> {
    logger.debug(
      "[start] append:" +
        JSON.stringify(filter) +
        ", field:" +
        JSON.stringify(field) +
        ", data:" +
        JSON.stringify(data)
    );
    const result = await this.db
      .collection(collectionName)
      .findOneAndUpdate(filter, "$pull", { returnDocument: "after" });
    logger.debug("[end] append:" + JSON.stringify(result));
    return result.value;
  }

  async deleteOne(
    filter: Record<string, unknown>,
    collectionName: string = this.collectionName
  ): Promise<any> {
    logger.debug("[start] deleteOne:" + JSON.stringify(filter));
    const result = await this.db.collection(collectionName).deleteOne(filter);
    logger.debug("[end] deleteOne:" + JSON.stringify(filter));
    return result;
  }
}

export default Model;
