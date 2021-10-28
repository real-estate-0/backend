import { expect } from "chai";
import { app } from "../src/app";
import { MongoConnector } from "../src/connector/mongo";

import httpStatus from "http-status";
import faker from "faker";
import request from "supertest";

describe("app.ts", () => {
   before(async () => {
      await MongoConnector.connect();
  });

  describe("GET /v1/auth/login", () => {
   before(async () => {
      const db = await MongoConnector.getDb();
      //db.collection('users').deleteMany({}); 
    });
    after(async () => {
    });
    /*

    it("should return 200 and successfully register user if request data is ok", async () => {
      const userInfo = { userId: 'admin', password: 'admin', role: 'admin', name: 'admin' }
      const res = await request(app)
        .post("/api/v1/users")
        .send(userInfo)
        .expect(httpStatus.CREATED);
    });

    */
    it("should return 200 and successfully register user if request data is ok", async () => {
      const userInfo = { userId: 'admin', password: 'admin' }
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(userInfo)
        .expect(httpStatus.OK);
    });




    it("should return 401 if unauthorized", async () => {
      const userInfo = { userId: 'admin', password: 'xxxxx' }
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(userInfo)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /v1/auth/login", () => {
    it("should return 200 if users exists", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .expect((res) =>{
            console.log('users',res.body)
         })
        .expect(httpStatus.OK);
    });
  })

  describe("GET /v1/auth/reports", () => {

    it("should return 200 if report exits", async () => {
      const res = await request(app)
        .get("/api/v1/reports")
        .expect((res) =>{
            console.log('reports',res.body)
         })
        .expect(httpStatus.OK);
    });

    it("should return 201 if report created", async () => {
      let report = {
        title: 'abc',
        paragraphs: [ {
          title: 'subheaer1',
          text: 'text1',
        },
        {
          talleColumn: ['a','b','c'],
          tableRow: [ [1,2,3], [4,5,6] ]
        },
        ] 
      }

      const res = await request(app)
        .post("/api/v1/reports")
        .send(report)
        .expect((res) =>{
            console.log('create report', res.body)
         })
        .expect(httpStatus.OK);

      it("should return 200 if user exists", async () => {
        const res = await request(app)
          .get("/api/v1/reports?_id=6179ee5a06eab3638a7b4c6a")
          .expect((res) =>{
              console.log('report',res.body)
           })
          .expect(httpStatus.OK);
      });
    });
  })
});
