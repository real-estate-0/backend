import { expect } from "chai";
import { app } from "../../src/app";
//import { getConnection } from "../../src/connector/mongo";
import { MongoConnector } from "../../src/connector/mongo";
import httpStatus from "http-status";
import faker from "faker";
import request from "supertest";

describe("app.ts", () => {
  describe("POST  /v1/auth/register", () => {
    let newUser;
    let invalidUserEmail;
    let invalidUserId;
    let duplicateUserId;
    let duplicateUserEmail;

    before(async () => {
      await MongoConnector.connect();
      const db = await MongoConnector.getDb();
      console.log('db', db);
      db.collection("users").insertOne({
        userId: "test",
        email: "test2@email.com",
      });
      newUser = {
        userName: faker.name.middleName(),
        userId: faker.name.middleName().toLowerCase(),
        email: faker.internet.email().toLowerCase(),
        password: "password1",
        termsConfirm: true,
      };
      invalidUserEmail = {
        userName: faker.name.middleName(),
        userId: faker.name.middleName().toLowerCase(),
        email: "testmail",
        password: "password1",
        termsConfirm: true,
      };
      invalidUserId = {
        userName: faker.name.middleName(),
        userId: "a",
        email: "testmail",
        password: "password1",
        termsConfirm: true,
      };
      duplicateUserId = {
        userName: faker.name.middleName(),
        userId: "test",
        email: faker.internet.email().toLowerCase(),
        password: "password1",
        termsConfirm: true,
      };
      duplicateUserEmail = {
        userName: faker.name.middleName(),
        userId: "test3",
        email: "test2@email.com",
        password: "password1",
        termsConfirm: true,
      };
    });
    after(async () => {
      await MongoConnector.connect();
      const db = await MongoConnector.getDb();
      db.collection("users").drop();
    });

    it("should return 201 and successfully register user if request data is ok", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser)
        .expect(httpStatus.CREATED);
      expect(res.body.user).not.have.property("password");
      expect(res.body.user).to.have.all.keys(
        "_id",
        "userName",
        "userId",
        "email",
        "role",
        "termsConfirm"
      );
      expect(res.body.user).to.deep.include({
        userName: newUser.userName,
        userId: newUser.userId,
        email: newUser.email,
        role: "user",
        termsConfirm: true,
      });
      expect(res.body.tokens).to.have.all.keys("access", "refresh");
      expect(res.body.tokens.access).to.have.all.keys("token", "expires");
      expect(res.body.tokens.refresh).to.have.all.keys("token", "expires");
    });
  });

  it("app default test", () => {
    request(app)
      .get("/")
      .expect(200)
      .then((response) => {
        console.log("response", response.body);
      });
  });
});
