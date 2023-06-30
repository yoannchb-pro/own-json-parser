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

class ASTBuilder {
  /**
   * Return the error message for a given token
   * @param token
   * @returns
   */
  private getErrorMessage(token: TokenizerResult) {
    return `"${token.value}" is not valid JSON\nline: ${token.startLine}, column: ${token.startColumn}`;
  }

  /**
   * Format a string token to remove useless quotes and parse unicode
   * @param str
   * @returns
   */
  private formatStr(str: string) {
    return str
      .substring(1, str.length - 1) //We remove useless quotes
      .replace(/\\\\/g, "\\"); //TODO: Fixe this shit \\n -> \n
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
      properties: [] as any,
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
    const childrens: any[] = [tree];

    let lastScannedToken = null;
    for (let i = 0; i < tokens.length; ++i) {
      const actualToken = tokens[i];
      const actualChild = childrens[childrens.length - 1];

      const addASTBranch = (branch: ASTAnyValue) => {
        if ("value" in actualChild) {
          if (actualChild.value !== null)
            throw new SyntaxError(this.getErrorMessage(actualToken));
          actualChild.value = branch;
        } else actualChild.properties.push(branch);
      };

      if (actualToken.type === "UNKNOWN") {
        throw new SyntaxError(this.getErrorMessage(actualToken));
      } else if (
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
          actualChild.type === "ARRAY" &&
          actualChild.properties.length % 2 !== 0
        )
          throw new SyntaxError(this.getErrorMessage(lastScannedToken));
        if (actualChild.type !== "ARRAY")
          throw new SyntaxError(this.getErrorMessage(actualToken));
        childrens.pop();
      } else if (actualToken.type === "END_BRACE") {
        if (
          actualChild.type === "OBJECT" &&
          actualChild.properties.length % 2 !== 0
        )
          throw new SyntaxError(this.getErrorMessage(lastScannedToken));

        if (actualChild.type === "OBJECT_KEY") {
          childrens.pop();
        }

        if (childrens[childrens.length - 1].type !== "OBJECT")
          throw new SyntaxError(this.getErrorMessage(actualToken));

        childrens.pop();
      } else if (actualToken.type === "COMA") {
        if (actualChild.type !== "OBJECT_KEY" && actualChild.type !== "ARRAY") {
          throw new SyntaxError(this.getErrorMessage(actualToken));
        }

        if (actualChild.type === "OBJECT_KEY") {
          childrens.pop();
        }
      } else if (actualToken.type === "COLON") {
        if (actualChild.type !== "OBJECT_KEY") {
          throw new SyntaxError(this.getErrorMessage(actualToken));
        }
      }

      if (actualToken.type !== "WHITE_SPACE") lastScannedToken = actualToken;
    }

    return tree;
  }
}

export default ASTBuilder;
