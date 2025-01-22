export default function normaliseSchema(schema) {
  const newSchema = {};
  Object.entries(schema).forEach(([srcKey, schemaDef]) => {
    let defaultValue = schemaDef.defaultValue;
    const type = schemaDef.type;
    if (type === "number") {
      defaultValue = defaultValue ?? 0;
    }
    if (type === "boolean") {
      defaultValue = defaultValue ?? false;
    }

    newSchema[srcKey] = {
      ...schemaDef,
      defaultValue,
    };
  });
  return newSchema;
}
