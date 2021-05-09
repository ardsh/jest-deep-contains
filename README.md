# jest-deep-contains

> Assert deeply nested values in [Jest](https://facebook.github.io/jest/)

## Installation

```sh
yarn add -D jest-deep-contains
```

## Setup

Add `jest-deep-contains` to Jest's `setupFilesAfterEnv` configuration:

```js
"jest": {
  "setupFilesAfterEnv": ["jest-deep-contains"]
}
```

If you already have a setup file, simply import jest-deep-contains from there

```js
import 'jest-deep-contains'
```

## Usage

### deepContains([object])

Allows partially matching objects or elements of arrays.

```js
test('contains deep partial object', () => {
    const actual = [{
        a: 1,
        b: 2,
        c: {
            d: 4,
            e: 5,
        }
    }, {
        a: 3
    }];
    expect(actual).deepContains({
        a: 1 //PASS
    });
    expect(actual).deepContains({
        c: {
            e: 5, //PASS
        }
    });
    expect(actual).deepContains({
        a: 2 //FAIL
    });
});
```

### oneOf([members])

```js
expect(2).oneOf([5, 2, 7])
expect(1).not.oneOf([2, 3, 4, 5]);
```

### asString([regex])

Tries to convert the object to a string before matching with a regex pattern

```js
expect(new Date()).toEqual(
    expect.asString(/^2022-02/)
)
```

### parseJson([object])

Parses a JSON string before comparing with an object

```js
const json = `{ "body": { "items": [1, 2, 3] } }`
expect(json).toEqual(
    expect.parseJSON({
        body: {
            items: [1, 2, 3]
        }
    })
)
```
