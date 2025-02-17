import { decode, encode } from "@abcnews/base-36-text";

/** accepts a stream and returns an ArrayBuffer with the contents of the stream */
async function streamToArray(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const totalLength = chunks.reduce(
    (total, current) => total + current.byteLength,
    0
  );

  const newArray = new Uint8Array(totalLength);

  let offset = 0;
  chunks.forEach((uint8array) => {
    newArray.set(uint8array, offset);
    offset += uint8array.byteLength;
  });
  return newArray;
}

function getGlobal() {
  return typeof window !== "undefined" ? window : global;
}

/**
 * Load the de/compression stream polyfill
 */
async function loadPolyfill() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://www.abc.net.au/res/sites/news-projects/lib-compression-streams-polyfill/1.0.1/compression-streams-polyfill-0.1.7.js";
    s.type = "text/javascript";
    s.onerror = reject;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

const CODEC = "deflate-raw";
/**
 * Compress a string using deflate-raw.
 *
 * This requires CompressionStreams, so older versions of Safari need a polyfill.
 */
async function zip(string) {
  const _CompressionStream = getGlobal().CompressionStream;
  if (!_CompressionStream) {
    await loadPolyfill();
  }
  const compressedStream = new Blob([string], { type: "text/plain" })
    .stream()
    .pipeThrough(new _CompressionStream(CODEC));
  const buffer = await streamToArray(compressedStream);
  return buffer;
}

/**
 * Decompress a some data that was previously compressed with `zip`.
 *
 * This requires CompressionStreams, so older versions of Safari need a polyfill.
 */
async function unzip(buffer) {
  const _DecompressionStream = getGlobal().DecompressionStream;
  if (!_DecompressionStream) {
    await loadPolyfill();
  }

  const decompressedStream = new Blob([buffer])
    .stream()
    .pipeThrough(new _DecompressionStream(CODEC));

  const decompressedBuffer = await streamToArray(decompressedStream);
  const text = new TextDecoder().decode(decompressedBuffer);
  return text;
}

/** Convert an ArrayBuffer to base64  */
function bin2base64(binary) {
  const stringified = String.fromCharCode
    .apply(null, binary)
    .replace(/=+$/, "");
  const encoded = encode(stringified);
  return encoded;
}

/** Convert base64 string encoded with `bin2base64` back to an ArrayBuffer */
function base642bin(str) {
  const decoded = decode(str);
  const chars = decoded.split("").map((char) => char.charCodeAt(0));

  const newArray = new Uint8Array(chars.length);
  newArray.set(chars);
  return newArray;
}

export async function encodeString(string) {
  const compressed = await zip(string);
  const compressedEncoded = bin2base64(compressed);
  return compressedEncoded;
}

export async function decodeString(encodedString) {
  const compressedDecoded = base642bin(encodedString);
  const decoded = await unzip(compressedDecoded);
  return decoded;
}

export const GzipCodec = {
  encode: encodeString,
  decode: decodeString,
};
