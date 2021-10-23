import { expect } from "chai";
import config from "config";
import { MongoConnector } from "./mongo";
import mongodb from "mongodb";

describe("mongo.ts", () => {
  it("mongo insert", async () => {
    await MongoConnector.connect();
    const db: any = await MongoConnector.getDb();
    //const db: any = await getConnection();
    await db.collection("test").drop();
    console.log("test collection droped");
    await db.collection("test").insertOne({ foo: "bar" });
    const doc = await db
      .collection("test")
      .findOne({ foo: "bar" }, { projection: { foo: 1, _id: 0 } });
    console.log("doc", doc);
    expect(doc.foo).to.equal("bar");
  });
});
