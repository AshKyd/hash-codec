import { parse, stringify } from "@abcnews/alternating-case-to-object";
import encodeSchema from "./encodeSchema.js";
import decodeSchema from "./decodeSchema.js";
export default class HashSync {
  currentHash = "";
  schema = {};
  onChange = () => {};
  #data = {};
  constructor({ schema = {}, onChange }) {
    console.log("🐧 constructor");
    this.schema = schema;
    this.onChange = onChange;
    window.addEventListener("hashchange", () => {
      this.dataString = this.getHash();
    });
    this.dataString = this.getHash();
  }
  getHash() {
    return window.location.hash.slice(1);
  }

  get data() {
    console.log("👾 get data");
    return this.#data;
  }

  set data(newData) {
    console.log("🏝️ set data");
    this.#data = newData;
    const newHash = "#" + this.dataString;
    if (window.location.hash !== newHash) {
      console.log("setting hash");
      window.location.hash = newHash;
    }
  }

  set dataString(string) {
    console.log("🍊 set dataString");
    const existingDataString = this.dataString;
    console.log({ existingDataString });
    if (string === existingDataString) {
      console.log("string is the same");
      return;
    }
    console.log("setting data");

    const encodedData = parse(string);
    const decodedData = decodeSchema(this.schema, encodedData);

    console.log({ decodedData });

    this.#data = decodedData;
    this.onChange({ data: decodedData });
  }

  get dataString() {
    console.log("🍈 get dataString");
    const encodedData = encodeSchema(this.schema, this.data);
    const stringified = stringify(encodedData);
    return stringified;
  }
}
