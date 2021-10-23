import { expect } from "chai";
import User from "./user.model";
import { MongoConnector } from "../connector/mongo";
import faker from "faker";
import { Db } from "mongodb";

const fakerUser: IUser = {
  userName: faker.name.lastName(),
  userId: faker.name.firstName(),
  email: faker.internet.email(),
  password: "1234",
};

const fakerUser2: IUser = {
  userName: faker.name.lastName(),
  userId: faker.name.firstName(),
  email: faker.internet.email(),
  password: "4567",
};

describe("User model unittest", () => {
  let userObjectId;
  let db;

  beforeEach(async function () {
    db = await MongoConnector.getDb();
    await db.collection("users").deleteMany({});
    const doc = await db.collection("users").insertOne(fakerUser);
    console.log("inserted", doc);
    userObjectId = doc["insertedId"];
  });

  it("User model create should be return faker", async function () {
    const user = await User.create(fakerUser2);
    expect(user.password).to.not.exist;
    expect(user.userName).to.equal(fakerUser2.userName);
  });

  it("User model isUserIdExists should be return true", async function () {
    const isExists = await User.isUserIdExists(fakerUser.userId);
    console.log("isExists", isExists);
    expect(isExists).to.equal(true);

    const isExistsFalse = await User.isEmailExists(fakerUser.email);
    expect(isExistsFalse).to.equal(true);
  });

  it("User exists model isUserIdExists should be return false", async function () {
    const result = await User.isUserIdExists(fakerUser2.userId);
    expect(result).to.equal(false);

    const resultEmail = await User.isEmailExists(fakerUser2.email);
    expect(resultEmail).to.equal(false);
  });

  it("User model updatePassword and comparePassword should be return boolean", async function () {
    const result = await User.updatePassword(userObjectId, "newpassword");
    expect(result).to.equal(true);
    const correct = await User.comparePassword(userObjectId, "newpassword");
    expect(correct).to.equal(true);

    const incorrect = await User.comparePassword(userObjectId, "oldpassword");
    expect(incorrect).to.equal(false);
  });

  it("User model findById should return User", async function () {
    console.log("userObjectId", userObjectId);
    const user = await User.findById(userObjectId);
    console.log("userObjectId", user, fakerUser);
    expect(user.userName).to.equal(fakerUser.userName);
    //expect(User.password).to.not.exist;
  });
});
