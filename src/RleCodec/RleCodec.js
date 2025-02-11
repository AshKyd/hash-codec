import { bwt, inverseBwt } from "./bwt.js";
import { decodeRle, encodeRle } from "./rle.js";

async function encodeString(string, { delineator }) {
  const bwtString = bwt(string, { delineator });
  const rleString = encodeRle(bwtString);
  return rleString;
}

async function decodeString(string, { delineator }) {
  const bwtString = decodeRle(string);
  const decodedString = inverseBwt(bwtString, { delineator });
  return decodedString;
}

/**
 * Factory to return a run-length encoder codec.
 *
 * This codec supports lowercase strings only, and requires one character
 * to be dedicated as a delineator char. Therefore this isn't suitable to
 * free text, but config strings can be compressed well.
 *
 * @see {@link https://en.wikipedia.org/wiki/Burrows%E2%80%93Wheeler_transform Burrows-Wheeler Transform}
 * @see {@link https://en.wikipedia.org/wiki/Run-length_encoding Run-length encoding}
 *
 * @param {Object} opts
 * @param {string} opts.delineator - character to delineate the EOL during the BWT
 * @returns {Object<string,function>}
 */
export function getRleCodec({ delineator = "q" }) {
  if (delineator.length !== 1) {
    throw new Error("Delineator must be 1 char");
  }
  return {
    encode: (string) => encodeString(string, { delineator }),
    decode: (string) => decodeString(string, { delineator }),
  };
}
