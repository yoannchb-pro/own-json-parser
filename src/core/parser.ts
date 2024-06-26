import type { ASTArray, ASTObject, ASTResult, ASTSimple } from "../types/ast";
import type {
  JSONArray,
  JSONObject,
  JSONResult,
  JSONPrimitif,
} from "../types/json";
import ASTBuilder from "./astBuilder";
import Tokenizer from "./tokenizer";

const TOKENS = {
  STRING: /(")(?:\\\1|.)*?\1/,
  NUMBER: /\d+(?:\.\d+)?/,
  WHITE_SPACE: /\s+/,
  COMA: /,/,
  COLON: /:/,
  TRUE_BOOLEAN: /true/,
  FALSE_BOOLEAN: /false/,
  NULL: /null/,
  START_BRACKET: /\[/,
  END_BRACKET: /\]/,
  START_BRACE: /\{/,
  END_BRACE: /\}/,
} as const;

/**
 * JSON parser for a given string
 */
class Parser {
  private astBuilder = new ASTBuilder();
  private tokenizer = new Tokenizer({
    tokens: TOKENS,
    callback: (token) => {
      if (token.type === "UNKNOWN")
        throw new SyntaxError(this.astBuilder.getErrorMessage(token));
      return token;
    },
  });

  /**
   * Parse a JSON string and return the object
   * @param str
   * @returns
   */
  parse(str: string | null | boolean | number): JSONResult {
    str = String(str);
    const tokens = this.tokenizer.tokenize(str);
    const ast = this.astBuilder.buildAST(tokens);
    return this.parseASTBranch(ast.value);
  }

  private parseASTBranch(astBranch: ASTResult["value"]): JSONResult {
    if (astBranch.type === "OBJECT") {
      return this.parseObject(astBranch);
    }

    if (astBranch.type === "ARRAY") {
      return this.parseArray(astBranch);
    }

    return this.parsePrimitif(astBranch);
  }

  private parseArray(astBranch: ASTArray): JSONArray {
    const json: JSONArray = [];
    for (const property of astBranch.properties) {
      json.push(this.parseASTBranch(property));
    }
    return json;
  }

  private parseObject(astBranch: ASTObject): JSONObject {
    const json: JSONObject = {};
    for (const property of astBranch.properties) {
      json[property.name] = this.parseASTBranch(property.value);
    }
    return json;
  }

  private parsePrimitif(astBranch: ASTSimple): JSONPrimitif {
    return astBranch.value;
  }
}

export default Parser;
