const MAX_BINARY_CHARS = 5;
const ALPHA_CHARS_COUNT = 26;
const ASCII_ALPHA_START = 97;
const ASCII_NUM_START = 48;
/**
 * Encode a boolean array as a string
 *
 * This treats the array as binary data & encodes it as base26 (a-z0-9) to
 * reduce the size.
 *
 * @param {any[]} array - array of truthy/falsy values
 * @returns string
 */
const encodeBinary = async (array) => {
  // pad start with a 1 to protect any leading zeroes
  // split array into a binary string, [true,false] => '10'
  const string = [1, ...array].map((val) => (val ? 1 : 0)).join("");

  // chunks are groups of `MAX_BINARY_CHARS` that we can convert to alphanumeric
  // values later. e.g. '1111111111' => ['11111','11111']
  const chunks = [];
  for (let i = string.length; i > 0; i -= MAX_BINARY_CHARS) {
    chunks.push(string.slice(Math.max(0, i - MAX_BINARY_CHARS), i));
  }
  chunks.reverse();

  // Convert our binary numbers to decimal ['11111'] => [31]
  const charCodes = chunks.map((binary) => parseInt(binary, 2));

  // Convert the binary numbers to base26/mapping them to the right values on
  // the ASCII table
  const values = charCodes.map((num) => {
    return num > ALPHA_CHARS_COUNT
      ? num % ALPHA_CHARS_COUNT
      : String.fromCharCode(num + ASCII_ALPHA_START);
  });

  // here is our string
  const encodedString = values.join("");
  return encodedString;
};

/**
 * Decode a string encoded by encodeBinary. This returns an array of booleans.
 * @param {string} string - encoded string
 * @returns boolean[]
 */
async function decodeBinary(string) {
  // split into array of chars
  const chars = string.split("");
  // get the ascii code from the char
  const charCodesRaw = chars.map((char) => char.charCodeAt(0));
  // map the ascii codes back down to 0-36
  const charCodesUnmapped = charCodesRaw.map((val) =>
    val >= ASCII_ALPHA_START
      ? val - ASCII_ALPHA_START
      : val - ASCII_NUM_START + ALPHA_CHARS_COUNT
  );

  // for each code, convert it back to binary
  const binaryChunks = charCodesUnmapped.map((charCode, i) =>
    Number(charCode)
      .toString(2)
      // padStart everything but the first chunk, because we know there is a
      // leading 1 to protect it
      .padStart(i > 0 ? MAX_BINARY_CHARS : 0, "0")
  );

  // map the binary back to individual bools
  const values = binaryChunks.flatMap((chunk) =>
    chunk.split("").map((val) => val === "1")
  );

  //remove the leading 1
  return values.slice(1);
}

export const BinaryCodec = {
  encode: encodeBinary,
  decode: decodeBinary,
};
