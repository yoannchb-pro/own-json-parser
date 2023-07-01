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
    const lines = str.split(/\n/g);

    let totalCharDone = 0;
    for (let startLine = 0; startLine < lines.length; ++startLine) {
      const line = lines[startLine];

      for (let startColumn = 0; startColumn < line.length; ++startColumn) {
        const charIndex = startColumn + totalCharDone;

        let result = null;
        for (const [type, value] of Object.entries(this.tokens)) {
          result = this.matcher(
            str.substring(charIndex, str.length),
            type,
            value
          );
          if (result.type !== this.defaultType) break;
        }

        const matchedSentence = str.substring(
          charIndex,
          charIndex + result.wordLength
        );
        const matchedSentenceLinesNumber =
          matchedSentence.match(/\n/g)?.length ?? 0;
        tokens.push({
          type: result.type,
          value: matchedSentence,
          startLine,
          startColumn,
          endLine: startLine + matchedSentenceLinesNumber,
          endColumn: startColumn + result.wordLength - 1, // -1 because we don't want the next char but the last letter of the token value
        });
        startColumn += result.wordLength - 1;
      }

      totalCharDone += line.length + 1; // +1 because the \n have a length of 1 and is removed by the split
    }

    return tokens;
  }
}

export default Tokenizer;
