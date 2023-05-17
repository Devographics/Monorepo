import { ResponseDocument } from "@devographics/core-models";
import type { Actions } from "./validation";

export interface SchemaObject {
  type?:
    | DateConstructor
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor;
  requiredDuring?: Actions;
  clientMutable?: boolean;
}

export type Schema = {
  [key in string]: SchemaObject;
};

/*

All fields can only be accessed by document owner.

Some fields can be mutated by owner from client; or else only from server

*/

export const defaultSchemaObject: SchemaObject = {
  type: String,
  requiredDuring: undefined,
  clientMutable: false,
};

export const extendSchema = (schema) => {
  Object.keys(schema).forEach((key) => {
    schema[key] = { ...defaultSchemaObject, ...schema[key] };
  });
  return schema;
};

/*

Convert any date received from the client from a string back into an actual Date object

*/
export const restoreTypes = ({
  document,
  schema,
}: {
  document: ResponseDocument;
  schema: Schema;
}) => {
  Object.keys(schema).forEach((fieldName) => {
    const schemaObject = schema[fieldName];
    if (!!document[fieldName] && schemaObject.type === Date) {
      document[fieldName] = new Date(document[fieldName]);
    }
  });
  return document;
};
