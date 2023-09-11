/**
 * Homemade generic schema system,
 * that can be later converted to a specific format like Zod validation
 */
import type { ResponseDocument } from "@devographics/types";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { Actions } from "./validation";
import clone from "lodash/clone.js";

export interface OnCreateProps {
  currentUser: any;
  clientData: ResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
}

export interface OnUpdateProps extends OnCreateProps {
  existingResponse: ResponseDocument;
  updatedResponse: ResponseDocument;
}

export type OnCreate<T> = (prop: OnCreateProps) => T | undefined;
export type OnUpdate<T> = (prop: OnUpdateProps) => T | undefined;

export interface SchemaObject<T> {
  type: T;
  requiredDuring?: Actions;
  /**
   * Whether this field can be set client-side
   * Other fields are meant to be set by the server (various metadata for instance)
   */
  clientMutable?: boolean;
  isArray?: boolean;
  onCreate?: OnCreate<
    T extends StringConstructor
    ? string
    : T extends NumberConstructor
    ? number
    : T extends BooleanConstructor
    ? boolean
    : Date
  >;
  onUpdate?: OnUpdate<
    T extends StringConstructor
    ? string
    : T extends NumberConstructor
    ? number
    : T extends BooleanConstructor
    ? boolean
    : Date
  >;
}

export type Schema = {
  [key in string]: SchemaObject<
    DateConstructor | StringConstructor | NumberConstructor | BooleanConstructor
  >;
};

/*

All fields can only be accessed by document owner.

Some fields can be mutated by owner from client; or else only from server

*/

export const defaultSchemaObject: SchemaObject<StringConstructor> = {
  type: String,
  requiredDuring: undefined,
  clientMutable: false,
};

export const extendSchema = (schema: any) => {
  Object.keys(schema).forEach((key) => {
    schema[key] = { ...defaultSchemaObject, ...schema[key] };
  });
  return schema;
};

/**

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

export const runFieldCallbacks = async <
  T extends OnCreateProps | OnUpdateProps
>({
  document,
  schema,
  action,
  props,
}: {
  document: ResponseDocument;
  schema: Schema;
  action: Actions;
  props: T;
}) => {
  const documentWithCallbacks = clone(document);
  for (const fieldName of Object.keys(schema)) {
    const field = schema[fieldName];
    const callback =
      (action === Actions.CREATE && field.onCreate) ||
      (action === Actions.UPDATE && field.onUpdate);
    if (callback) {
      documentWithCallbacks[fieldName] = await callback(props);
    }
  }
  return documentWithCallbacks;
};
