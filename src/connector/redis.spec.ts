import { expect } from "chai";
import { getConnection } from "./redis";

describe("redis.ts", () => {
  it("redis insert", async () => {
    //const db: any = await MongoConnector.getDb();
    const redis: any = getConnection("auth");
    await redis.set("foo", "bar");
    expect(await redis.get("foo")).to.equal("bar");
  });
});
