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

const CODEC = "deflate-raw";
/**
 * Compress a string using deflate-raw.
 *
 * This requires CompressionStreams, so older versions of Safari need a polyfill.
 */
async function zip(string) {
  const compressedStream = new Blob([string], { type: "text/plain" })
    .stream()
    .pipeThrough(new CompressionStream(CODEC));
  const buffer = await streamToArray(compressedStream);
  return buffer;
}

/**
 * Decompress a some data that was previously compressed with `zip`.
 *
 * This requires CompressionStreams, so older versions of Safari need a polyfill.
 */
async function unzip(buffer) {
  const decompressedStream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream(CODEC));

  const decompressedBuffer = await streamToArray(decompressedStream);
  const text = new TextDecoder().decode(decompressedBuffer);
  return text;
}

/** Convert an ArrayBuffer to base64  */
function bin2base64(binary) {
  return btoa(String.fromCharCode.apply(null, binary)).replace(/=+$/, "");
}

/** Convert base64 string encoded with `bin2base64` back to an ArrayBuffer */
function base642bin(str) {
  const decoded = atob(str);
  const chars = decoded.split("").map((char) => char.charCodeAt());

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

export const stringCodec = {
  encode: encodeString,
  decode: decodeString,
};
