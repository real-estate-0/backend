import { expect } from "chai";
import { app } from "../src/app";
import { MongoConnector } from "../src/connector/mongo";

import httpStatus from "http-status";
import faker from "faker";
import request from "supertest";

describe("app.ts", () => {
  describe("POST  /v1/auth/login", () => {

   before(async () => {
      await MongoConnector.connect();
    
    });
    after(async () => {
    });

    it("should return 200 and successfully register user if request data is ok", async () => {
      const userInfo = { userId: 'admin', password: 'admin', role: 'admin', name: 'admin' }
      const res = await request(app)
        .post("/api/v1/users")
        .send(userInfo)
        .expect(httpStatus.CREATED);
    });
 
    it("should return 200 and successfully register user if request data is ok", async () => {
      const userInfo = { userId: 'admin', password: 'admin' }
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(userInfo)
        .expect(httpStatus.OK);
    });
    it("should return 401 ", async () => {
      const userInfo = { userId: 'admin', password: 'xxxxx' }
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(userInfo)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
