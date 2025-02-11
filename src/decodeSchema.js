import normaliseSchema from "./normaliseSchema.js";

export default async function decodeSchema({ schema, data: encodedData }) {
  const normalisedSchema = normaliseSchema(schema);
  const decodedObject = {};
  const keyPromises = Object.entries(normalisedSchema).map(
    async ([srcKey, schemaDef]) => {
      const { type, key, values, defaultValue, codec } = schemaDef;

      let decodedValue = encodedData[key || srcKey];

      if (!decodedValue) {
        if (typeof defaultValue !== "undefined") {
          decodedObject[srcKey] = defaultValue;
        }
        return;
      }

      if (codec) {
        decodedValue = await codec.decode(decodedValue);
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
    }
  );

  await Promise.all(keyPromises);
  return decodedObject;
}
