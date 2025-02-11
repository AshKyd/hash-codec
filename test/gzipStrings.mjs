import assert from "assert";
import { decodeString, encodeString } from "../src/GzipCodec/GzipCodec.js";

describe("strings", () => {
  describe("encode", function () {
    it("should encode a string", async function () {
      const res = await encodeString("Hello world!");
      assert.deepEqual(res, "muyjam2w8egzebizw5c2y9c8n16mpds");
    });
  });

  describe("decode", function () {
    it("should decode a string", async function () {
      const res = await decodeString("muyjam2w8egzebizw5c2y9c8n16mpds");
      assert.deepEqual(res, "Hello world!");
    });
  });
});
