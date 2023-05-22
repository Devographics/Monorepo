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

const getZodType = (type: any) => {
  switch (type) {
    case String:
    default:
      return z.string();
    case Boolean:
      return z.boolean();
    case Date:
      return z.date();
    case Number:
      return z.number();
  }
};

type ZodObject =
  | z.ZodString
  | z.ZodBoolean
  | z.ZodDate
  | z.ZodNumber
  | z.ZodOptional<z.ZodString>
  | z.ZodOptional<z.ZodBoolean>
  | z.ZodOptional<z.ZodDate>
  | z.ZodOptional<z.ZodNumber>;

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
  const { type, requiredDuring, clientMutable } = schemaObject;
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

  let zType = getZodType(type);
  if (zType === z.string()) {
    zType = zType.max(GLOBAL_TEXTFIELD_LIMIT);
  }
  return isRequired ? zType : zType.optional();
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
