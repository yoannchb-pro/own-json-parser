import Parser from "./core/parser";

const parser = new Parser();
const JSONParser = parser.parse.bind(parser);

export default JSONParser;
