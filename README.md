# Hash Codec

A JavaScript library for encoding and decoding values to strings with validation support. This library provides various codecs and utilities for data transformation and serialization.

## Features

- Multiple encoding/decoding strategies:
  - Gzip compression
  - Run-Length Encoding (RLE)
  - Binary encoding
- Schema-based validation
- Svelte store integration

## Installation

```bash
npm install hash-codec
```

## Usage

This library works well with [@abcnews/alternating-case-to-object](https://github.com/abcnews/alternating-case-to-object) (ACTO), but isn't prescriptive about it.

For this reason the library takes an object as an input and returns an object as an output. Since libraries like svelte-scrollyteller automatically decode ACTO objects, we don't attempt to handle that in the main schema functionality. So you may sometimes need to use both libraries in conjunction.

### Basic Encoding/Decoding

```javascript
import { encodeSchema, decodeSchema } from 'hash-codec';

// Define a schema with proper type definitions and keys
const schema = {
  version: {
    // Number types are rounded to the nearest whole number.
    type: 'number',
    key: 'ver'
  },
  name: {
    // String types are free text. You must sanitise these yourself,
    // especially if passing them to ACTO encode.
    type: 'string',
    key: 'n'
  },
  name: {
    // String type, encoded as base36. Safe to pass to ACTO without
    // any sanitisation
    type: 'base36string',
    key: 'n'
  },
  isActive: {
    // Boolean type, true or false.
    type: 'boolean',
    key: 'ia',
    defaultValue: false
  },
  status: {
    // Enum values are translated into an integer for the matching array index.
    // Be careful to keep your arrays in a consistent order, or your outputs
    // will change.
    type: 'enum',
    key: 's',
    defaultValue: 'pending',
    values: ['pending', 'active', 'inactive']
  },
  customData: {
    // A custom codec. Specify an encode and decode functino of your own to
    // sanitise/encode data for this field.
    type: 'custom',
    key: 'cd',
    codec: {
      encode: (data) => customEncode(data),
      decode: (encoded) => customDecode(encoded)
    }
  }
};

// Encode data
const encoded = encodeSchema({name: 'grug', age: 99}, schema);

// Decode data
const decoded = decodeSchema(encoded, schema);
```

### Using Codecs

```javascript
import { getRleCodec, getBinaryCodec } from 'hash-codec';

// Run-Length Encoding
const rleDelineator = 'q';
const rleCodec = getRleCodec({ delineator: rleDelineator });
const encoded = rle.encode('aaaaaaaabaaaxyzaaaaa');
// a8qba3xyza5
const decoded = rle.decode(encoded);
// Binary encoding
const binary = getBinaryCodec();
const binaryData = binary.encode([true,false,false,false,true,true]);
const original = binary.decode(binaryData);
```

Codecs can be used as-is in the schema:

```js
const schema = {
    myField: {
        key:'x',
        type: 'custom',
        codec: rleCodec,
    }
}
```

### Writing custom codecs
You can write a codec of your own, as long as it has an encode() and decode() function. These may be synchronous or async.

```js
const twoDecimalPointCodec = {
    encode: num => Math.round(num*100),
    decode: string => Number(string)/100
}
```

### Svelte Integration

The svelte store is useful for builders and contexts where you want to sync the data to and from a hash in the URL bar. This is probably not useful as a production-facing utility.

```js
import { makeSvelteStore } from 'hash-codec';

const store = makeSvelteStore(initialData, schema);
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```
