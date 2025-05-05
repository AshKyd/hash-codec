import { writable } from "svelte/store";
import { decodeHash, encodeHash } from "./hashUtils.js";

/**
 * Take a schema and set up a Svelte Store to sync with the url bar.
 *
 * This is async, so you should add a loading state/wait for it to become available.
 * @template T
 * @param {Object<string,any>} schema - Schema to initialise, see the readme.
 */
export function makeSvelteStore(schema) {
  const hashConfig = writable(/** @type {T} */ (null));

  async function getHash() {
    const hash = window.location.hash.slice(1);
    const decodedData = await decodeHash(schema, hash);
    return decodedData;
  }

  /** The previously set hash string */
  let hashString;
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
      const stringifiedHash = "#" + (await encodeHash(schema, data));
      if (window.location.hash !== stringifiedHash) {
        window.location.hash = stringifiedHash;
      }
      hashString = stringifiedHash;
    });

    // On hash change, decode and set the store as required
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash;

      // Hash string hasn't changed
      if (newHash === hashString) {
        return;
      }

      // New values found, update the store
      getHash().then((data) => {
        hashConfig.set(data);
      });
    });
  });

  return hashConfig;
}
