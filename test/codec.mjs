import assert from "assert";
import encode from "../src/encode.js";
import { decode } from "../src/decode.js";
import { encodeString, stringCodec } from "../src/string.js";

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

describe("encode", async function () {
  it("should throw on unknown keys", async function () {
    let error;
    try {
      await encode({ schema, data: { pimple: true } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Unknown keys found in data");
  });
  it("should pass through strings", async function () {
    const res = await encode({ schema, data: { name: "Ashley" } });
    assert.deepEqual(res, { name: "Ashley" });
  });
  it("should pass through numbers", async function () {
    const res = await encode({ schema, data: { age: 99 } });
    assert.deepEqual(res, { age: 99 });
  });
  it("should encode bools", async function () {
    const res = await encode({ schema, data: { hasKeys: true } });
    assert.deepEqual(res, { haskeys: 1 });
  });
  it("should use srcKey when key prop not set in schema", async function () {
    const res = await encode({ schema, data: { url: "https://ash.ms" } });
    assert.deepEqual(res, { url: "https://ash.ms" });
  });
  it("should return index for enum", async function () {
    const res = await encode({ schema, data: { country: "New Zealand" } });
    assert.deepEqual(res, { country: 1 });
  });
  it("should return nothing for default value enum", async function () {
    const res = await encode({ schema, data: { country: "Australia" } });
    assert.deepEqual(res, {});
  });
  it("should throw an error on unknown enum", async function () {
    let error;
    try {
      await encode({ schema, data: { country: "Florin" } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Invalid enum value");
  });
});

describe("decode", async function () {
  it("should return default values", async function () {
    const res = await decode({ schema, data: { pimple: true } });
    assert.deepEqual(res, { age: 0, country: "Australia", hasKeys: false });
  });
  it("should pass through strings", async function () {
    const res = await decode({ schema, data: { name: "Ashley" } });
    assert.equal(res.name, "Ashley");
  });
  it("should numberise numbers", async function () {
    const res = await decode({ schema, data: { age: "99" } });
    assert.equal(res.age, 99);
  });
  it("should encode falsy bools", async function () {
    const res = await decode({ schema, data: { haskeys: "0" } });
    assert.equal(res.hasKeys, false);
  });
  it("should encode truthy bools", async function () {
    const res = await decode({ schema, data: { haskeys: "1" } });
    assert.equal(res.hasKeys, true);
  });
  it("should use srcKey when key prop not set in schema", async function () {
    const res = await decode({ schema, data: { url: "https://ash.ms" } });
    assert.equal(res.url, "https://ash.ms");
  });
  it("should return value of enum", async function () {
    const res = await decode({ schema, data: { country: "1" } });
    assert.equal(res.country, "New Zealand");
  });
  it("should return default value for unknown enum", async function () {
    const res = await decode({ schema, data: { country: "76" } });
    assert.equal(res.country, "Australia");
  });
});

describe("custom codec", async function () {
  const schema = {
    myCustomString: {
      type: "custom",
      key: "s",
      codec: stringCodec,
    },
  };

  describe("with custom string encoder", async () => {
    const res = await encode({
      schema,
      data: { myCustomString: "Hello world!!" },
    });
    assert.deepEqual(res, { s: "80jNyclXKM8vyklRVAQA" });
  });
  describe("with custom string decoder", async () => {
    const res = await decode({
      schema,
      data: { s: "80jNyclXKM8vyklRVAQA" },
    });
    assert.deepEqual(res, { myCustomString: "Hello world!!" });
  });
});
