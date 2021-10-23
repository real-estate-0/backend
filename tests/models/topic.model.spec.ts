import { expect } from "chai";
import Topic from "./topic.model";
import { MongoConnector } from "../connector/mongo";
import faker from "faker";
import { Db } from "mongodb";

const fakerTopic: ITopic = {
  topicName: faker.company.companyName(),
  topicDescription: faker.company.catchPhrase(),
  createUserObjectId: faker.name.firstName(),
  password: "1234",
  members: ["testUserObjectId1"],
  managers: ["testUserObjectId1"],
  groupObjectId: "testGroupObjectId",
};

const fakerTopic2: ITopic = {
  topicName: faker.company.companyName(),
  topicDescription: faker.company.catchPhrase(),
  createUserObjectId: faker.name.firstName(),
  password: "4567",
  groupObjectId: "testGroupObjectId",
};

describe("topic model unittest", () => {
  let topicObjectId;
  let db;

  before(async function () {
    db = await MongoConnector.getDb();
    const result = await db.collection("topics").insertOne(fakerTopic);
    topicObjectId = result.insertedId;
  });

  it("topic model create should be return faker", async function () {
    const topic = await Topic.create(fakerTopic2);
    expect(topic.topicName).to.equal(fakerTopic2.topicName);
    const collections = db.listCollections({
      name: Topic.PREFIX_TOPIC + topic._id,
    });
    expect(await collections.hasNext()).to.equal(true);
    //expect(topic.password).to.not.exist;
  });

  it("topic model isExists should be return boolean", async function () {
    const isExists = await Topic.isExistsTopicName(fakerTopic.topicName);
    expect(isExists).to.equal(true);

    const isExistsFalse = await Topic.isExistsTopicName("test-topic");
    expect(isExistsFalse).to.equal(false);
  });

  it("topic model updatePassword and comparePassword should be return boolean", async function () {
    const result = await Topic.updatePassword(topicObjectId, "newpassword");
    expect(result).to.equal(true);
    const correct = await Topic.comparePassword(topicObjectId, "newpassword");
    expect(correct).to.equal(true);

    const incorrect = await Topic.comparePassword(topicObjectId, "oldpassword");
    expect(incorrect).to.equal(false);
  });

  it("topic model findByMemberObjectId should return topic", async function () {
    const topic = await Topic.findById(topicObjectId);
    expect(topic.topicName).to.equal(fakerTopic.topicName);
    //expect(topic.password).to.not.exist;
  });

  //not check userobjecid validation it's service layer
  //it's only check operation
  it("topic model add member should return topic", async function () {
    const topic = await Topic.appendMember(topicObjectId, "testUserObjectId");
    expect(topic.topicName).to.equal(fakerTopic.topicName);
    expect(topic.members).to.deep.include("testUserObjectId");
  });

  it("topic model delete member should return topic", async function () {
    const topic = await Topic.deleteMember(topicObjectId, "testUserObjectId");
    expect(topic.topicName).to.equal(fakerTopic.topicName);
    expect(topic.members).to.not.deep.include("testUserObjectId");
    expect(topic.members).to.deep.include("testUserObjectId1");
  });

  it("topic model add manager should return topic", async function () {
    const topic = await Topic.appendManager(topicObjectId, "testUserObjectId");
    expect(topic.topicName).to.equal(fakerTopic.topicName);
    expect(topic.managers).to.deep.include("testUserObjectId");
  });

  it("topic model delete manager should return topic", async function () {
    const topic = await Topic.deleteManager(topicObjectId, "testUserObjectId");
    expect(topic.topicName).to.equal(fakerTopic.topicName);
    expect(topic.managers).to.not.deep.include("testUserObjectId");
    expect(topic.managers).to.deep.include("testUserObjectId1");
  });
});
