import normaliseSchema from "./normaliseSchema.js";

export default function encode({ schema, data }) {
  const normalisedSchema = normaliseSchema(schema);
  const encodedObject = {};

  const unknownKeys = Object.keys(data).filter((key) => !schema[key]);

  if (unknownKeys.length) {
    console.error(`Unknown keys found in data: ${unknownKeys.join()}`);
    throw new Error("Unknown keys found in data");
  }

  Object.entries(normalisedSchema).forEach(([srcKey, schemaDef]) => {
    const { type, key, values, defaultValue } = schemaDef;
    const resolvedKey = key || srcKey;

    const srcValue = data[srcKey];
    if (typeof srcValue === "undefined") return;
    if (srcValue === defaultValue) return;

    let encodedValue = srcValue;

    if (type === "enum") {
      const resolvedEnum = values.indexOf(srcValue);
      if (resolvedEnum === -1) {
        console.error(`Enum value "${srcValue}" not found in ${values}`);
        throw new Error("Invalid enum value");
      }
      encodedValue = resolvedEnum;
    }

    if (type === "boolean") {
      encodedValue = encodedValue ? 1 : 0;
    }

    encodedObject[resolvedKey] = encodedValue;
  });
  return encodedObject;
}
