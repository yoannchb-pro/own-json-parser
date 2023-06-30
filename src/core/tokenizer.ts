import type TokenizerResult from "../types/tokenizerResult";

type Tokens = {
  [key: string]: RegExp;
};

type MatcherResult = {
  type: string;
  wordLength: number;
};

/**
 * Tokenize any string with given tokens
 */
class Tokenizer {
  private defaultType = "UNKNOWN";

  constructor(private tokens: Tokens = {}) {}

  /**
   * Set the default type if no token was match
   * Default: UNKNOWN
   * @param type
   */
  setDefaultType(type: string) {
    this.defaultType = type;
  }

  /**
   * Get the default type if no token was match
   * @returns
   */
  getDefaultType() {
    return this.defaultType;
  }

  /**
   * Get the list registered of the tokens
   * @returns
   */
  getTokens() {
    return this.tokens;
  }

  /**
   * Add a new token to match
   * @param type
   * @param value
   */
  addToken(type: string, value: RegExp) {
    this.tokens[type] = value;
  }

  /**
   * Check if a given token match the start of the string
   * @param str
   * @param type
   * @param value
   * @returns
   */
  private matcher(str: string, type: string, value: RegExp): MatcherResult {
    value.lastIndex = 0;
    const match = value.exec(str);
    if (!match || match.index !== 0) {
      return { type: this.defaultType, wordLength: 1 };
    }
    return {
      type,
      wordLength: match[0].length,
    };
  }

  /**
   * Tokenize a string
   * @param str
   * @returns
   */
  tokenize(str: string): TokenizerResult[] {
    const tokens = [];
    const lines = str.split(/(\n)/g);

    for (let startLine = 0; startLine < lines.length; ++startLine) {
      const line = lines[startLine];

      for (let startColumn = 0; startColumn < line.length; ++startColumn) {
        const charIndex = (startLine + 1) * (startColumn + 1) - 1;

        let result = null;
        for (const [type, value] of Object.entries(this.tokens)) {
          result = this.matcher(
            str.substring(charIndex, str.length),
            type,
            value
          );
          if (result.type !== this.defaultType) break;
        }

        tokens.push({
          type: result.type,
          value: str.substring(charIndex, charIndex + result.wordLength),
          startLine,
          startColumn,
          endLine: startLine,
          endColumn: startColumn + result.wordLength - 1,
        });
        startColumn += result.wordLength - 1;
      }
    }

    return tokens;
  }
}

export default Tokenizer;
