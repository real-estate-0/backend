import { expect } from "chai";
import Group from "./group.model";
import { MongoConnector } from "../connector/mongo";
import faker from "faker";

const fakerGroup: IGroup = {
  groupName: faker.company.companyName(),
  groupDescription: faker.company.catchPhrase(),
  createUserObjectId: faker.name.firstName(),
  password: "1234",
  members: ["testUserObjectId1"],
  managers: ["testUserObjectId1"],
};

const fakerGroup2: IGroup = {
  groupName: faker.company.companyName(),
  groupDescription: faker.company.catchPhrase(),
  createUserObjectId: faker.name.firstName(),
  password: "4567",
};

describe("group model unittest", () => {
  let groupObjectId;

  before(async function () {
    const db = await MongoConnector.getDb();
    console.log("mongo connector db", db);
    const result = await db.collection("groups").insertOne(fakerGroup);
    groupObjectId = result.insertedId;
  });

  it("group model create should be return faker", async function () {
    const group = await Group.create(fakerGroup2);
    console.log("created group", group);
    expect(group.groupName).to.equal(fakerGroup2.groupName);
    //expect(group.password).to.not.exist;
  });

  it("group model isExists should be return boolean", async function () {
    const isExists = await Group.isExistsGroupName(fakerGroup.groupName);
    expect(isExists).to.equal(true);

    const isExistsFalse = await Group.isExistsGroupName("test-group");
    expect(isExistsFalse).to.equal(false);
  });

  it("group model updatePassword and comparePassword should be return boolean", async function () {
    console.log("updatedpassword groupid", groupObjectId);
    const result = await Group.updatePassword(groupObjectId, "newpassword");
    expect(result).to.equal(true);
    const correct = await Group.comparePassword(groupObjectId, "newpassword");
    expect(correct).to.equal(true);

    const incorrect = await Group.comparePassword(groupObjectId, "oldpassword");
    expect(incorrect).to.equal(false);
  });

  it("group model findByMemberObjectId should return group", async function () {
    console.log("groupobjectid", groupObjectId);
    const group = await Group.findById(groupObjectId);
    console.log("group", group);
    expect(group.groupName).to.equal(fakerGroup.groupName);
    //expect(group.password).to.not.exist;
  });

  //not check userobjecid validation it's service layer
  //it's only check operation
  it("group model add member should return group", async function () {
    const group = await Group.appendMember(groupObjectId, "testUserObjectId");
    expect(group.groupName).to.equal(fakerGroup.groupName);
    expect(group.members).to.deep.include("testUserObjectId");
  });

  it("group model delete member should return group", async function () {
    const group = await Group.deleteMember(groupObjectId, "testUserObjectId");
    expect(group.groupName).to.equal(fakerGroup.groupName);
    expect(group.members).to.not.deep.include("testUserObjectId");
    expect(group.members).to.deep.include("testUserObjectId1");
  });

  it("group model add manager should return group", async function () {
    const group = await Group.appendManager(groupObjectId, "testUserObjectId");
    expect(group.groupName).to.equal(fakerGroup.groupName);
    expect(group.managers).to.deep.include("testUserObjectId");
  });

  it("group model delete manager should return group", async function () {
    const group = await Group.deleteManager(groupObjectId, "testUserObjectId");
    expect(group.groupName).to.equal(fakerGroup.groupName);
    expect(group.managers).to.not.deep.include("testUserObjectId");
    expect(group.managers).to.deep.include("testUserObjectId1");
  });
});
