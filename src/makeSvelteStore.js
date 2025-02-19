import { parse, stringify } from "@abcnews/alternating-case-to-object";
import decodeSchema from "./decodeSchema.js";
import encodeSchema from "./encodeSchema.js";
import { writable } from "svelte/store";

/**
 * Take a schema and set up a Svelte Store to sync with the url bar.
 *
 * This is async, so you should add a loading state/wait for it to become available.
 * @template T
 * @param {Object<string,any>} schema - Schema to initialise, see the readme.
 */
export function makeSvelteStore(schema) {
  async function getHash() {
    const hash = window.location.hash.slice(1);
    const data = parse(hash);
    const decodedData = await decodeSchema({ schema, data: data });
    return decodedData;
  }

  const hashConfig = writable(/** @type {T} */ (null));

  getHash().then((data) => {
    // At some point we need to set data onto the <T>. We know it's vaguely
    // Object<string,any> shaped, but we don't need to know the implementation
    // details because these are specified by the consumer of makeSvelteStore.
    //@ts-ignore
    hashConfig.set(data);
    hashConfig.subscribe(async (data) => {
      if (!data) {
        return;
      }
      const encodedData = await encodeSchema({ schema, data });
      const stringifiedHash = "#" + stringify(encodedData);
      if (window.location.hash !== stringifiedHash) {
        window.location.hash = stringifiedHash;
      }
    });
  });

  return hashConfig;
}
