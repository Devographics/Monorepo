import { z } from "zod";
import { SchemaObject, Schema } from "./schemas";

export const GLOBAL_TEXTFIELD_LIMIT = 500;

export interface DetailedErrorObject {
  id: string;
  message: string;
  properties?: any;
  error?: any;
  status?: number;
}

export enum ActionContexts {
  CLIENT = "client",
  SERVER = "server",
}

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

type ConstructorType =
  | StringConstructor
  | BooleanConstructor
  | NumberConstructor
  | DateConstructor;

const getZodType = (type: ConstructorType): ZodObjectContents => {
  switch (type) {
    case String:
    default:
      return z.string();
    case Boolean:
      return z.boolean();
    case Date:
      return z.date();
    case Number:
      // TODO: double-check if we sometimes need to accept negative numerical values?
      return z.number().gte(0);
  }
};

type ZodObjectContents = z.ZodString | z.ZodBoolean | z.ZodDate | z.ZodNumber;

type ZodObjectValueOrArray = z.ZodArray<ZodObjectContents> | ZodObjectContents;

type ZodObject = z.ZodOptional<ZodObjectValueOrArray> | ZodObjectValueOrArray;

const getZodObject = <T>({
  fieldName,
  schemaObject,
  action,
  context,
}: {
  fieldName: string;
  schemaObject: SchemaObject<T>;
  action: Actions;
  context: ActionContexts;
}): ZodObject => {
  const { type, requiredDuring, clientMutable, isArray } = schemaObject;
  /*
    A field is required if:

    1. we are processing a CREATE (or UPDATE) action, and the field is required on CREATE (or UPDATE)
    2.  A) the field is mutable from the client, and this is a CLIENT context
        OR
        B) the field is NOT mutable from the client, and this is a SERVER context
  */
  const isRequired =
    requiredDuring === action &&
    (clientMutable
      ? context === ActionContexts.CLIENT
      : context === ActionContexts.SERVER);

  // @ts-ignore
  let zType = getZodType(type);
  if (zType === z.string()) {
    zType = zType.max(GLOBAL_TEXTFIELD_LIMIT);
  }

  console.log(type);
  console.log(zType);

  // @ts-ignore
  zType = isArray ? zType.array() : zType;
  // @ts-ignore
  zType = isRequired ? zType : zType.optional();
  return zType;
};

export const getZodSchema = ({
  schema,
  action,
  context,
}: {
  schema: Schema;
  action: Actions;
  context: ActionContexts;
}) => {
  const zObject: any = {};
  const allFieldNames = Object.keys(schema);
  // if we're validating client input, only keep fields that are mutable by client
  const fieldNames =
    context === ActionContexts.CLIENT
      ? allFieldNames.filter((key) => schema[key].clientMutable)
      : allFieldNames;
  // build Zod object
  fieldNames.forEach((fieldName) => {
    const schemaObject = schema[fieldName];
    zObject[fieldName] = getZodObject({
      fieldName,
      schemaObject,
      action,
      context,
    });
  });
  return z.object(zObject).strict();
};
