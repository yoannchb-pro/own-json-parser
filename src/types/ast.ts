type SimpleASTType =
  | "STRING"
  | "NUMBER"
  | "NULL_VALUE"
  | "TRUE_BOOLEAN"
  | "FALSE_BOOLEAN";

type ASTBoolean = {
  type: "BOOLEAN";
  value: boolean;
};

type ASTString = {
  type: "STRING";
  value: string;
};

type ASTNumber = {
  type: "NUMBER";
  value: number;
};

type ASTNull = {
  type: "NULL_VALUE";
  value: null;
};

type ASTSimple = ASTNull | ASTString | ASTBoolean | ASTNumber;

type ASTObjectKey = {
  type: "OBJECT_KEY";
  name: string;
  properties: ASTSimple[];
};

type ASTObject = {
  type: "OBJECT";
  properties: ASTObjectKey[];
};

type ASTArray = {
  type: "ARRAY";
  properties: ASTSimple[];
};

type ASTFinalValue =
  | ASTArray
  | ASTBoolean
  | ASTNull
  | ASTNumber
  | ASTObject
  | ASTString;

type ASTResult = {
  type: "JSON";
  properties: ASTFinalValue[];
};

type ASTChildren = ASTResult | ASTArray | ASTObjectKey | ASTObject;

export {
  ASTArray,
  ASTBoolean,
  ASTNull,
  ASTNumber,
  ASTObject,
  ASTObjectKey,
  ASTSimple,
  ASTString,
  ASTResult,
  ASTChildren,
};
