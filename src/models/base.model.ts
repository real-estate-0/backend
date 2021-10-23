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
    query: object,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug("[start] findOne:" + JSON.stringify(query));
    const result = await this.db.collection(collectionName).findOne(query);
    logger.debug("[end] findOne:" + JSON.stringify(result));
    if (!result) return null;
    return result;
  }

  async find<T>(
    query: object,
    collectionName: string = this.collectionName
  ): Promise<T[]> {
    logger.debug(`[start] find:${collectionName}` + JSON.stringify(query));
    const result = await this.db
      .collection(collectionName)
      .find(query, { projection: { password: 0 } })
      .toArray();
    logger.debug("[end] find:" + JSON.stringify(result));
    return result;
  }

  async findById<T>(
    objectId: string,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug("[start] findById:" + JSON.stringify(objectId));
    const result = await this.db
      .collection(collectionName)
      .findOne({ _id: new ObjectID(objectId) });
    logger.debug("[end] findById:" + JSON.stringify(result));
    return result;
  }

  async findByIds<T>(
    objectIds: string[],
    field = "_id",
    collectionName: string = this.collectionName
  ): Promise<T[]> {
    logger.debug(`[start] findByIds: ${JSON.stringify(objectIds)}`);
    const ids =
      field == "_id"
        ? objectIds.map((_id: string) => new ObjectID(_id))
        : objectIds;
    logger.debug(
      `[params] collection: ${
        this.collectionName
      } findByIds:${field} ids:${JSON.stringify(ids)}`
    );
    const result = await this.db
      .collection(collectionName)
      .find({ [field]: { $in: ids } })
      .toArray();
    logger.debug(`[end] findByIds: ${JSON.stringify(result)}`);
    return result;
  }

  async insertOne(
    data: object,
    collectionName: string = this.collectionName
  ): Promise<any> {
    logger.debug("[start] base insertOne:" + JSON.stringify(data));
    logger.debug("insertOne collectionName:" + collectionName);

    const result = await this.db.collection(collectionName).insertOne(data);
    console.log("insertOne", result);
    logger.debug("[end] insertOne:" + JSON.stringify(result.ops));
    return result.ops[0];
  }

  async updateOne<T>(
    filter: object,
    operation: object,
    collectionName: string = this.collectionName
  ): Promise<T> {
    logger.debug(
      "[start] updateOne:" +
        JSON.stringify(filter) +
        ", operation:" +
        JSON.stringify(operation)
    );
    let result = await this.db
      .collection(collectionName)
      .findOneAndUpdate(filter, operation, {
        returnDocument: "after",
        projection: { password: 0 },
      });
    logger.debug("[end] updateOne:" + JSON.stringify(result));
    return result.value;
  }

  async append(
    filter: object,
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
    filter: object,
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
    filter: object,
    collectionName: string = this.collectionName
  ): Promise<any> {
    logger.debug("[start] deleteOne:" + JSON.stringify(filter));
    const result = await this.db
      .collection(collectionName)
      .findOneAndDelete(filter, {});
    logger.debug("[end] deleteOne:" + JSON.stringify(result));
    return result.value;
  }
}

export default Model;
