import assert from "assert";
import encode from "../src/encode.js";
import { decode } from "../src/decode.js";

const schema = {
  name: {
    type: "string",
    key: "name",
  },
  age: {
    type: "number",
    key: "age",
  },
  country: {
    type: "enum",
    values: ["Australia", "New Zealand", "Papua New Guinea"],
    key: "country",
    defaultValue: "Australia",
  },
  hasKeys: {
    key: "haskeys",
    type: "boolean",
    defaultValue: false,
  },
  url: {
    type: "string",
  },
};

describe("encode", function () {
  it("should throw on unknown keys", function () {
    let error;
    try {
      encode({ schema, data: { pimple: true } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Unknown keys found in data");
  });
  it("should pass through strings", function () {
    const res = encode({ schema, data: { name: "Ashley" } });
    assert.deepEqual(res, { name: "Ashley" });
  });
  it("should pass through numbers", function () {
    const res = encode({ schema, data: { age: 99 } });
    assert.deepEqual(res, { age: 99 });
  });
  it("should encode bools", function () {
    const res = encode({ schema, data: { hasKeys: true } });
    assert.deepEqual(res, { haskeys: 1 });
  });
  it("should use srcKey when key prop not set in schema", function () {
    const res = encode({ schema, data: { url: "https://ash.ms" } });
    assert.deepEqual(res, { url: "https://ash.ms" });
  });
  it("should return index for enum", function () {
    const res = encode({ schema, data: { country: "New Zealand" } });
    assert.deepEqual(res, { country: 1 });
  });
  it("should return nothing for default value enum", function () {
    const res = encode({ schema, data: { country: "Australia" } });
    assert.deepEqual(res, {});
  });
  it("should throw an error on unknown enum", function () {
    let error;
    try {
      encode({ schema, data: { country: "Florin" } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Invalid enum value");
  });
});

describe("decode", function () {
  it("should return default values", function () {
    const res = decode({ schema, data: { pimple: true } });
    assert.deepEqual(res, { age: 0, country: "Australia", hasKeys: false });
  });
  it("should pass through strings", function () {
    const res = decode({ schema, data: { name: "Ashley" } });
    assert.equal(res.name, "Ashley");
  });
  it("should numberise numbers", function () {
    const res = decode({ schema, data: { age: "99" } });
    assert.equal(res.age, 99);
  });
  it("should encode falsy bools", function () {
    const res = decode({ schema, data: { haskeys: "0" } });
    assert.equal(res.hasKeys, false);
  });
  it("should encode truthy bools", function () {
    const res = decode({ schema, data: { haskeys: "1" } });
    assert.equal(res.hasKeys, true);
  });
  it("should use srcKey when key prop not set in schema", function () {
    const res = decode({ schema, data: { url: "https://ash.ms" } });
    assert.equal(res.url, "https://ash.ms");
  });
  it("should return value of enum", function () {
    const res = decode({ schema, data: { country: "1" } });
    assert.equal(res.country, "New Zealand");
  });
  it("should return default value for unknown enum", function () {
    const res = decode({ schema, data: { country: "76" } });
    assert.equal(res.country, "Australia");
  });
});
