import assert from "assert";
import encodeSchema from "../src/encodeSchema.js";
import decodeSchema from "../src/decodeSchema.js";
import { GzipCodec } from "../src/GzipCodec/GzipCodec.js";
import { getRleCodec } from "../src/RleCodec/RleCodec.js";
import { BinaryCodec } from "../src/BinaryCodec/BinaryCodec.js";

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

describe("encodeSchema", async function () {
  it("should throw on unknown keys", async function () {
    let error;
    try {
      await encodeSchema({ schema, data: { pimple: true } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Unknown keys found in data");
  });
  it("should pass through strings", async function () {
    const res = await encodeSchema({ schema, data: { name: "Ashley" } });
    assert.deepEqual(res, { name: "Ashley" });
  });
  it("should pass through numbers", async function () {
    const res = await encodeSchema({ schema, data: { age: 99 } });
    assert.deepEqual(res, { age: 99 });
  });
  it("should encode bools", async function () {
    const res = await encodeSchema({ schema, data: { hasKeys: true } });
    assert.deepEqual(res, { haskeys: 1 });
  });
  it("should use srcKey when key prop not set in schema", async function () {
    const res = await encodeSchema({ schema, data: { url: "https://ash.ms" } });
    assert.deepEqual(res, { url: "https://ash.ms" });
  });
  it("should return index for enum", async function () {
    const res = await encodeSchema({
      schema,
      data: { country: "New Zealand" },
    });
    assert.deepEqual(res, { country: 1 });
  });
  it("should return nothing for default value enum", async function () {
    const res = await encodeSchema({ schema, data: { country: "Australia" } });
    assert.deepEqual(res, {});
  });
  it("should throw an error on unknown enum", async function () {
    let error;
    try {
      await encodeSchema({ schema, data: { country: "Florin" } });
    } catch (e) {
      error = e;
    }
    assert.equal(error?.message, "Invalid enum value");
  });
});

describe("decodeSchema", async function () {
  it("should return default values", async function () {
    const res = await decodeSchema({ schema, data: { pimple: true } });
    assert.deepEqual(res, { age: 0, country: "Australia", hasKeys: false });
  });
  it("should pass through strings", async function () {
    const res = await decodeSchema({ schema, data: { name: "Ashley" } });
    assert.equal(res.name, "Ashley");
  });
  it("should numberise numbers", async function () {
    const res = await decodeSchema({ schema, data: { age: "99" } });
    assert.equal(res.age, 99);
  });
  it("should encode falsy bools", async function () {
    const res = await decodeSchema({ schema, data: { haskeys: "0" } });
    assert.equal(res.hasKeys, false);
  });
  it("should encode truthy bools", async function () {
    const res = await decodeSchema({ schema, data: { haskeys: "1" } });
    assert.equal(res.hasKeys, true);
  });
  it("should use srcKey when key prop not set in schema", async function () {
    const res = await decodeSchema({ schema, data: { url: "https://ash.ms" } });
    assert.equal(res.url, "https://ash.ms");
  });
  it("should return value of enum", async function () {
    const res = await decodeSchema({ schema, data: { country: "1" } });
    assert.equal(res.country, "New Zealand");
  });
  it("should return default value for unknown enum", async function () {
    const res = await decodeSchema({ schema, data: { country: "76" } });
    assert.equal(res.country, "Australia");
  });
});

describe("custom codec (GzipCodec)", async function () {
  const schema = {
    myCustomString: {
      type: "custom",
      key: "s",
      codec: GzipCodec,
    },
  };

  it("should encode", async () => {
    const res = await encodeSchema({
      schema,
      data: { myCustomString: "Hello world!" },
    });
    assert.deepEqual(res, { s: "muyjam2w8egzebizw5c2y9c8n16mpds" });
  });
  it("should decode", async () => {
    const res = await decodeSchema({
      schema,
      data: { s: "muyjam2w8egzebizw5c2y9c8n16mpds" },
    });
    assert.deepEqual(res, { myCustomString: "Hello world!" });
  });
});

describe("custom codec (RleCodec)", async function () {
  const schema = {
    myCustomString: {
      type: "custom",
      key: "s",
      codec: getRleCodec({ delineator: "x" }),
    },
  };

  it("should encode", async () => {
    const res = await encodeSchema({
      schema,
      data: { myCustomString: "wooooohooooooo" },
    });
    assert.deepEqual(res, { s: "o5who6xo" });
  });
  it("should decode", async () => {
    const res = await decodeSchema({
      schema,
      data: { s: "o5who6xo" },
    });
    assert.deepEqual(res, { myCustomString: "wooooohooooooo" });
  });
});

describe("custom codec (BinaryCodec)", async function () {
  const schema = {
    binary: {
      type: "custom",
      codec: BinaryCodec,
    },
  };

  const binary = [
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
  ];

  it("should encode", async () => {
    const res = await encodeSchema({
      schema,
      data: { binary },
    });
    assert.deepEqual(res, { binary: "ek4" });
  });
  it("should decode", async () => {
    const res = await decodeSchema({
      schema,
      data: { binary: "ek4" },
    });
    assert.deepEqual(res, { binary });
  });
});
