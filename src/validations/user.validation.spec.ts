import { expect } from "chai";
import { schema } from "./user.validation";
import faker from "faker";

describe("user.validation.ts", () => {
  const user = {
    id: faker.datatype.uuid(),
    userId: faker.name.firstName(),
    email: faker.internet.email(),
    cellPhone: faker.phone.phoneNumber(),
    dept: faker.company.companyName(),
  };
  const incorrectUser = {
    id: faker.datatype.uuid(),
    userId: faker.name.middleName(),
    cellPhone: faker.phone.phoneNumber(),
    dept: faker.company.companyName(),
  };
  /*
  it("validate correct", () => {
    console.log(schema.validate(user), user);

    expect(schema.validate(user).value).to.equal(user);
  });
  it("validate incorrect", () => {
    console.log(schema.validate(user), user);
    expect(schema.validate(incorrectUser).value).to.equal({});
  });
  */
});
