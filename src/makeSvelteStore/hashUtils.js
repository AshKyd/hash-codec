import { parse, stringify } from "@abcnews/alternating-case-to-object";
import decodeSchema from "../decodeSchema.js";
import encodeSchema from "../encodeSchema.js";

/**
 * Decode an ACTO hash with the given schema
 * @param {Object<string,any>} schema
 * @param {string} hash
 * @returns {Object<string,any>}
 */
export async function decodeHash(schema, hash) {
  const data = parse(hash);
  const decodedData = await decodeSchema({ schema, data: data });
  return decodedData;
}

/**
 * Encode data with the given schema to a stringified ACTO hash
 * @param {Object<string,any>} schema
 * @param {Object<string,any>} data
 * @returns {string}
 */
export async function encodeHash(schema, data) {
  const encodedData = await encodeSchema({ schema, data });
  const stringifiedHash = stringify(encodedData);
  return stringifiedHash;
}
