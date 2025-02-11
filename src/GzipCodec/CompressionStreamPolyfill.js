import {
  makeCompressionStream,
  makeDecompressionStream,
} from "compression-streams-polyfill/ponyfill";

const bundle = { makeCompressionStream, makeDecompressionStream };
export default bundle;
