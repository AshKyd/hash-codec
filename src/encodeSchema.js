import { encode } from "@abcnews/base-36-text";
import normaliseSchema from "./normaliseSchema.js";

/**
 *
 * @param {Object} options
 * @param {Object<string, any>} options.schema
 * @param {Object<string, any>} options.data
 * @returns {Promise<Object<string, any>>}
 */
export default async function encodeSchema({ schema, data }) {
  const normalisedSchema = normaliseSchema(schema);
  const encodedObject = {};

  const unknownKeys = Object.keys(data).filter((key) => !schema[key]);

  if (unknownKeys.length) {
    console.error(`Unknown keys found in data: ${unknownKeys.join()}`);
    throw new Error("Unknown keys found in data");
  }

  const keyPromises = Object.entries(normalisedSchema).map(
    async ([srcKey, schemaDef]) => {
      const { type, key, values, defaultValue, codec } = schemaDef;
      const resolvedKey = key || srcKey;

      const srcValue = data[srcKey];
      if (typeof srcValue === "undefined") return;
      if (srcValue === defaultValue) return;

      let encodedValue = srcValue;

      if (type === 'base36string') {
        encodedValue = encode(encodedValue);
      }

      if (type === "enum") {
        const resolvedEnum = values.indexOf(srcValue);
        if (resolvedEnum === -1) {
          console.error(`Enum value "${srcValue}" not found in ${values}`);
          throw new Error("Invalid enum value");
        }
        encodedValue = resolvedEnum;
      }

      if (codec) {
        encodedValue = await codec.encode(encodedValue);
      }

      if (type === "boolean") {
        encodedValue = encodedValue ? 1 : 0;
      }

      if (type === "number") {
        encodedValue = Math.round(encodedValue);
      }

      encodedObject[resolvedKey] = encodedValue;
    }
  );

  await Promise.all(keyPromises);

  return encodedObject;
}
