# own-json-parser

A JSON parser made in typescript with tokenizer, ast, parser ...

## Usage

`JSONParser` Should work as `JSON.parser`

```js
import JSONParser from "./dist";

JSONParser(
  '{ "greeting": "Hello World !", "error": false, "note": 20, "bool": "false" }'
);
//Ouput: { greeting: "Hello World !", error: false, note: 20, bool: "false" }

JSONParser('{ "greeting": "Hello World !", "test": [,] }');
//Will throw a SyntaxError for "," with line and column
```
