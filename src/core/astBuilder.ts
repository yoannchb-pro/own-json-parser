import type {
  ASTAnyValue,
  ASTArray,
  ASTBoolean,
  ASTChildren,
  ASTNull,
  ASTNumber,
  ASTObject,
  ASTObjectKey,
  ASTResult,
  ASTString,
} from "../types/ast";
import type TokenizerResult from "../types/tokenizerResult";

/**
 * Unraw a string to transform for example \\n to \n
 * @param rawString
 * @returns
 */
function unrawString(rawString: string) {
  return rawString.replace(/\\(.)/g, function (_, char) {
    if (char === "n") return "\n";
    if (char === "r") return "\r";
    if (char === "t") return "\t";
    if (char === "b") return "\b";
    if (char === "f") return "\f";
    if (char === "v") return "\v";
    return char;
  });
}

class ASTBuilder {
  /**
   * Return the error message for a given token
   * @param token
   * @returns
   */
  getErrorMessage(token: TokenizerResult) {
    return `"${token.value}" is not valid JSON\nline: ${token.startLine}, column: ${token.startColumn}`;
  }

  /**
   * Format a string token to remove useless quotes and parse unicode
   * @param str
   * @returns
   */
  private formatStr(str: string) {
    const content = str.substring(1, str.length - 1); //We remove useless quotes
    return unrawString(content); // turn \\n into \n ...
  }

  private appendBoolean(token: TokenizerResult): ASTBoolean {
    return {
      type: "BOOLEAN",
      value: token.type === "TRUE_BOOLEAN" ? true : false,
    };
  }

  private appendNullValue(token: TokenizerResult): ASTNull {
    return {
      type: "NULL_VALUE",
      value: null as null,
    };
  }

  private appendString(token: TokenizerResult): ASTString {
    return {
      type: "STRING",
      value: this.formatStr(token.value),
    };
  }

  private appendArray(token: TokenizerResult): ASTArray {
    return {
      type: "ARRAY",
      properties: [],
    };
  }

  private appendObject(token: TokenizerResult): ASTObject {
    return {
      type: "OBJECT",
      properties: [],
    };
  }

  private appendNumber(token: TokenizerResult): ASTNumber {
    return {
      type: "NUMBER",
      value: Number(token.value),
    };
  }

  private appendKey(token: TokenizerResult): ASTObjectKey {
    return {
      type: "OBJECT_KEY",
      name: this.formatStr(token.value),
      value: null,
    };
  }

  /**
   * Build the AST for given tokens
   * @param tokens
   * @returns
   */
  buildAST(tokens: TokenizerResult[]) {
    const tree: ASTResult = { type: "JSON", value: null };
    const childrens: ASTChildren[] = [tree];

    let lastScannedToken: TokenizerResult = null;
    for (let i = 0; i < tokens.length; ++i) {
      const actualToken = tokens[i];
      const actualChild = childrens[childrens.length - 1];

      const addASTBranch = (branch: ASTAnyValue) => {
        if (
          actualChild.type === "ARRAY" &&
          lastScannedToken !== null &&
          lastScannedToken.type !== "START_BRACKET" &&
          lastScannedToken.type !== "COMA"
        ) {
          throw new SyntaxError(this.getErrorMessage(lastScannedToken));
        }

        if (actualChild.type === "OBJECT" && branch.type !== "OBJECT_KEY") {
          throw new SyntaxError(this.getErrorMessage(actualToken));
        }

        if ("value" in actualChild) {
          if (actualChild.value !== null)
            throw new SyntaxError(this.getErrorMessage(actualToken));
          (actualChild as any).value = branch;
        } else actualChild.properties.push(branch as any);
      };

      if (
        actualToken.type === "TRUE_BOOLEAN" ||
        actualToken.type === "FALSE_BOOLEAN"
      ) {
        addASTBranch(this.appendBoolean(actualToken));
      } else if (actualToken.type === "NULL") {
        addASTBranch(this.appendNullValue(actualToken));
      } else if (actualToken.type === "NUMBER") {
        addASTBranch(this.appendNumber(actualToken));
      } else if (actualToken.type === "STRING") {
        if (actualChild.type === "OBJECT") {
          const child = this.appendKey(actualToken);
          addASTBranch(child);
          childrens.push(child);
        } else addASTBranch(this.appendString(actualToken));
      } else if (actualToken.type === "START_BRACKET") {
        const child = this.appendArray(actualToken);
        addASTBranch(child);
        childrens.push(child);
      } else if (actualToken.type === "START_BRACE") {
        const child = this.appendObject(actualToken);
        addASTBranch(child);
        childrens.push(child);
      } else if (actualToken.type === "END_BRACKET") {
        if (
          lastScannedToken?.type === "COMA" ||
          lastScannedToken?.type === "COLON"
        )
          throw new SyntaxError(this.getErrorMessage(lastScannedToken));

        if (actualChild.type !== "ARRAY")
          throw new SyntaxError(this.getErrorMessage(actualToken));

        childrens.pop();
      } else if (actualToken.type === "END_BRACE") {
        if (
          lastScannedToken?.type === "COMA" ||
          lastScannedToken?.type === "COLON"
        )
          throw new SyntaxError(this.getErrorMessage(lastScannedToken));

        if (actualChild.type === "OBJECT_KEY") childrens.pop();

        if (childrens[childrens.length - 1].type !== "OBJECT")
          throw new SyntaxError(this.getErrorMessage(actualToken));

        childrens.pop();
      } else if (actualToken.type === "COMA") {
        if (
          lastScannedToken?.type === "COMA" ||
          lastScannedToken?.type === "COLON"
        )
          throw new SyntaxError(this.getErrorMessage(actualToken));

        if (actualChild.type !== "OBJECT_KEY" && actualChild.type !== "ARRAY")
          throw new SyntaxError(this.getErrorMessage(actualToken));

        if (
          actualChild.type === "OBJECT_KEY" &&
          (actualChild as any).value === null
        )
          throw new SyntaxError(this.getErrorMessage(actualToken));

        if (actualChild.type === "OBJECT_KEY") childrens.pop();
      } else if (actualToken.type === "COLON") {
        if (
          lastScannedToken?.type !== "STRING" ||
          actualChild.type !== "OBJECT_KEY" ||
          (actualChild as any).value !== null
        )
          throw new SyntaxError(this.getErrorMessage(actualToken));
      }

      if (actualToken.type !== "WHITE_SPACE") lastScannedToken = actualToken;
    }

    //Last children should be the tree
    if (childrens.length !== 1)
      throw new SyntaxError(this.getErrorMessage(lastScannedToken));

    return tree;
  }
}

export default ASTBuilder;
