const rotateString = function (string) {
  return string.slice(string.length - 1) + string.slice(0, string.length - 1);
};

/**
 * Burrows-wheeler transform for text.
 * @param {string} text - plain text to apply BWT to
 * @returns {string}
 */
export const bwt = function (text, { delineator }) {
  text += delineator;
  const rotations = [];
  let last = text;
  for (let i = 0; i < text.length; i++) {
    last = rotateString(last);
    rotations.push(last);
  }
  rotations.sort();
  let finalString = "";
  for (let i = 0; i < rotations.length; i++) {
    finalString += rotations[i].charAt(rotations[i].length - 1);
  }
  return finalString;
};

export const inverseBwt = function (text, { delineator }) {
  const splitText = text.split("");
  const rotations = splitText.slice(0);
  for (let i = 0; i < text.length - 1; i++) {
    rotations.sort();
    for (let j = 0; j < text.length; j++) {
      rotations[j] = text[j] + rotations[j];
    }
  }
  const decodedRotation = rotations.filter(function (value) {
    return value.charAt(value.length - 1) === delineator;
  })[0];
  return decodedRotation.substring(0, text.length - 1);
};
