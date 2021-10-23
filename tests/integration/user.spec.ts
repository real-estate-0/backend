import request from "supertest";
import { app } from "../../src/app";
import httpStatus from "http-status";
import { expect } from "chai";
import { MongoConnector } from "../../src/connector/mongo";
import faker from "faker";

describe("user controller.ts", () => {
  describe("user resource test", () => {
    let token;
    let tempMemoId;
    let userObjectId;

    before(async () => {

      await MongoConnector.connect();
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ userId: "hyunny88", password: "021527aa!!" })
        .expect(httpStatus.OK);

      userObjectId = res.body.user._id;
      token = res.body.tokens.access.token;

      const testMemo = await request(app)
        .post(`/api/v1/users/${userObjectId}/memos`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "text",
          contents: "test memo",
        })
        .expect(httpStatus.CREATED);
      tempMemoId = testMemo.body.result._id;

    });
    
    /**
     * User Resource
     */

    it("getUser is only return 1 person", async () => {
      const res = await request(app)
        .get("/api/v1/users/60dece1a6d29650ab0907ea3")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK);
      console.log("get user result", res.body);
    });

    it("getUsers is return list", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK);
    });

    /**
      * memo resource
      */

    it("getMemos", async () => {
      const res = await request(app)
        .get("/api/v1/users/60dece1a6d29650ab0907ea3/memos")
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK);
    });

    it("getMemo", async () => {
      const res = await request(app)
        .get("/api/v1/users/60dece1a6d29650ab0907ea3/memos/" + tempMemoId)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK);
    });

    it("updateMemo", async () => {
      const res = await request(app)
        .put("/api/v1/users/60dece1a6d29650ab0907ea3/memos/" + tempMemoId)
        .set("Authorization", `Bearer ${token}`)
        .send({ contents: "modified memo" })
        .expect(httpStatus.NO_CONTENT);
    });

    it("deleteMemo", async () => {
      const res = await request(app)
        .put("/api/v1/users/60dece1a6d29650ab0907ea3/memos/" + tempMemoId)
        .set("Authorization", `Bearer ${token}`)
        .send({ contents: "modified memo" })
        .expect(httpStatus.NO_CONTENT);
    });

    after(async () => {});
  });
});
