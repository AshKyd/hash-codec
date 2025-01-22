import normaliseSchema from "./normaliseSchema.js";

export function decode({ schema, data: encodedData }) {
  const normalisedSchema = normaliseSchema(schema);
  const decodedObject = {};
  Object.entries(normalisedSchema).forEach(([srcKey, schemaDef]) => {
    const { type, key, values, defaultValue } = schemaDef;

    let decodedValue = encodedData[key || srcKey];

    if (!decodedValue) {
      if (typeof defaultValue !== "undefined") {
        decodedObject[srcKey] = defaultValue;
      }
      return;
    }

    if (type === "number") {
      decodedValue = Number(decodedValue);
    }
    if (type === "boolean") {
      decodedValue = decodedValue === "1";
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
  });
  return decodedObject;
}
