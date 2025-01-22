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

var CODEC = "deflate-raw";
async function compress(string) {
  const compressedStream = new Blob([string], { type: "text/plain" })
    .stream()
    .pipeThrough(new CompressionStream(CODEC));
  const buffer = await streamToArray(compressedStream);
  return buffer;
}

async function decompress(buffer) {
  const decompressedStream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream(CODEC));

  const decompressedBuffer = await streamToArray(decompressedStream);
  const text = new TextDecoder().decode(decompressedBuffer);
  return text;
}

function bin2base64(binary) {
  return btoa(String.fromCharCode.apply(null, binary)).replace(/=+$/, "");
}

function base642bin(str) {
  const decoded = atob(str);
  const chars = decoded.split("").map((char) => char.charCodeAt());

  const newArray = new Uint8Array(chars.length);
  newArray.set(chars);
  return newArray;
}
(async () => {
  const toCompress = '{"name": "Ash", "caption": "it\'s all gonna be fine"}';
  const compressed = await compress(toCompress);
  const compressedEncoded = bin2base64(compressed);
  const compressedDecoded = base642bin(compressedEncoded);
  const decompressed = await decompress(compressedDecoded);

  console.log({
    compressed,
    compressedEncoded,
    decompressed,
    compressedLength: compressed.length,
    decompressedLength: decompressed.length,
    compressedEncodedLength: compressedEncoded.length,
  });
})();
