import request from "supertest";
import { app } from "../../src/app";
import httpStatus from "http-status";
import { expect } from "chai";
import { MongoConnector } from "../../src/connector/mongo";
import faker from "faker";

describe("group controller.ts", () => {
  describe("group resource test", () => {
    let token;
    let tempMemoId;
    let userObjectId;
    let db;
    before(async () => {

      await MongoConnector.connect();
      db = await MongoConnector.getDb();
      await db.collection("groups").deleteMany({});
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ userId: "hyunny88", password: "021527aa!!" })
        .expect(httpStatus.OK);

      //userObjectId = res.body.user._id;
      token = res.body.tokens.access.token;
    });

    it("createGroup should return 1 group info", async ()=>{
     const groupInfo = await request(app)
        .post(`/api/v1/groups`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          groupName: "testGroup",
          description: "test Group description",
        })
        .expect(httpStatus.CREATED)
        .then(res =>{
          expect(res.body.result).to.have.all.keys('groupName', 'description', 'createdTime', '_id', 'updatedTime')
        })
    })

    it("getGroup should return 1 group info", async ()=>{
      const groups = await db.collection("groups").find({}).toArray();
      console.log('groups', groups)
      const groupInfo = await request(app)
        .get(`/api/v1/groups/${groups[0]["_id"]}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(res =>{
          console.log('res', res.body.result);
          expect(res.body.result).to.have.all.keys('groupName', 'description', 'createdTime', '_id', 'updatedTime')
        })
    })

    it("getGroups should return all group info", async ()=>{
      const groups = await db.collection("groups").find({}).toArray();
      console.log('groups', groups)
      const groupInfo = await request(app)
        .get(`/api/v1/groups`)
        .set("Authorization", `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(res =>{
          console.log('res', res.body.result);
          expect(res.body.result).to.lengthOf(1)
        })
    })

    after(async () => {
      await db.collection("groups").deleteMany({});
    });
  });
});
