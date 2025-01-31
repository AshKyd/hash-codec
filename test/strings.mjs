import assert from "assert";
import { decodeString, encodeString } from "../src/string.js";

describe("strings", () => {
  describe("encode", function () {
    it("should encode a string", async function () {
      const res = await encodeString("Hello world!");
      assert.deepEqual(res, "80jNyclXKM8vyklRBAA");
    });
  });

  describe("decode", function () {
    it("should decode a string", async function () {
      const res = await decodeString("80jNyclXKM8vyklRBAA");
      assert.deepEqual(res, "Hello world!");
    });
  });
});
