import { decode } from "@abcnews/base-36-text";
import normaliseSchema from "./normaliseSchema.js";

const ALLOWED_TYPES = ["number", "boolean", "enum", "string", "base36string", "custom"];

/**
 * Decode data using the given schema
 * @param {Object} options
 * @param {Object<string,any>} options.schema - Schema to initialise, see the readme.
 * @param {Object<string,any>} options.data - data to decode
 */
export default async function decodeSchema({ schema, data: encodedData }) {
  const normalisedSchema = normaliseSchema(schema);
  const decodedObject = {};
  const keyPromises = Object.entries(normalisedSchema).map(
    async ([srcKey, schemaDef]) => {
      const { type, key, values, defaultValue, codec } = schemaDef;
      if (!ALLOWED_TYPES.includes(type)) {
        throw new Error(
          `Unknown type "${type}", must be one of ${ALLOWED_TYPES}`
        );
      }

      let decodedValue = encodedData[key || srcKey];

      if (typeof decodedValue === "undefined") {
        if (typeof defaultValue !== "undefined") {
          decodedObject[srcKey] = defaultValue;
        }
        return;
      }

      if (codec) {
        decodedValue = await codec.decode(decodedValue);
      }

      if (type === 'base36string') {
        decodedValue = decode(decodedValue);
      }
      if (type === "number") {
        decodedValue = Number(decodedValue);
      }
      if (type === "boolean") {
        decodedValue = Number(decodedValue) === 1;
      }
      if (type === "enum") {
        const resolvedValue = values[decodedValue];
        if (typeof resolvedValue === "undefined") {
          decodedValue = defaultValue;
        } else {
          decodedValue = resolvedValue;
        }
      }
      decodedObject[srcKey] = decodedValue;
    }
  );

  await Promise.all(keyPromises);
  return decodedObject;
}
