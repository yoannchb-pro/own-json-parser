import JSONParser from "../dist";

describe("Should parse simple type", function () {
  it("Should parse null", function () {
    expect(JSONParser("null")).toBe(null);
  });

  it("Should parse true", function () {
    expect(JSONParser("true")).toBe(true);
  });

  it("Should parse false", function () {
    expect(JSONParser("false")).toBe(false);
  });

  it("Should parse a string", function () {
    expect(JSONParser('"hello world"')).toBe("hello world");
  });
});
