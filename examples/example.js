const json =
  '{"error": false, "test": "true \\n hello", "something": 53.6, "glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}';
const myParser = JSONParser(json),
  realParser = JSON.parse(json);
console.log(myParser);
console.log("Should Get: ", realParser);

function areJSONObjectsEqual(obj1, obj2) {
  const json1 = JSON.stringify(obj1);
  const json2 = JSON.stringify(obj2);

  return json1 === json2;
}

console.log("Are equal:", areJSONObjectsEqual(realParser, myParser));
console.log(JSONParser('"some \\n new line"'));
console.log(JSONParser('{"a": null,    }'));
