/**
 * Encode an aplha string using basic run-length encoding.
 *
 * e.g. 'aaaa' becomes 'a4'
 *
 * For best results use a burrows-wheeler transform before passing into this fn.
 * @param {string} string
 * @returns {string}
 */
export function encodeRle(string) {
  if (!string.match(/^[a-z]*$/)) {
    console.error("Unexpected characters in RLE encoder", string);
    throw new Error("RLE encoder only supports a-z values.");
  }

  return string
    .split("")
    .reduce((memo, value, index) => {
      if (index === 0 || value !== memo[memo.length - 1][0]) {
        memo.push([value, 1]);
      } else {
        memo[memo.length - 1][1]++;
      }

      return memo;
    }, [])
    .reduce((memo, [char, repeated]) => {
      return (memo += repeated === 1 ? char : char + String(repeated));
    }, "");
}

/**
 * Decode a run-length encoded string
 * @param {string} string
 * @returns {string}
 */
export function decodeRle(string) {
  return string.replace(/(\w)(\d+)/g, (_, char, repeated) =>
    char.repeat(+repeated)
  );
}
