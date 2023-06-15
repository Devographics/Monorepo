import { createGraphqlModel } from "@vulcanjs/graphql";
import { createModel } from "@vulcanjs/model";

// fixtures
const addressGroup = {
  name: "addresses",
  label: "Addresses",
  order: 10,
};
const permissions = {
  canRead: ["guests", "anyone"],
  canUpdate: ["quests"],
  canCreate: ["guests", "anyone"],
};

// just 1 input for state testing
const fooSchema = {
  foo: {
    type: String,
    ...permissions,
  },
};
//
export const addressSchema = {
  street: {
    type: String,
    optional: true,
    ...permissions,
  },
};
// example with custom inputs for the children
// ["http://maps/XYZ", "http://maps/foobar"]
const arrayOfUrlSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: String,
    input: "url",
  },
};
// example with array and custom input
const CustomObjectInput = () => "OBJECT INPUT";
const arrayOfCustomObjectSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: addressSchema,
    input: CustomObjectInput,
  },
};
// example with a fully custom input for both the array and its children
const ArrayInput = () => "ARRAY INPUT";
const arrayFullCustomSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
    input: ArrayInput,
  },
  "addresses.$": {
    type: String,
    input: "url",
  },
};
// example with a native type
// ["20 rue du Moulin PARIS", "16 rue de la poste PARIS"]

// eslint-disable-next-line no-unused-vars
const arrayOfStringSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: String,
  },
};
// object (not in an array): {street, city}
const objectSchema = {
  addresses: {
    type: addressSchema,
    ...permissions,
  },
};
// without calling SimpleSchema
// eslint-disable-next-line no-unused-vars
const bareObjectSchema = {
  addresses: {
    type: addressSchema,
    ...permissions,
  },
};

// stub collection
const createDummyCollection = (typeName, schema) =>
  createModel({
    name: typeName + "s",
    //typeName,
    schema,
  });
export const Foos = createDummyCollection("Foo", fooSchema);
// [{street, city,...}, {street, city, ...}]
const arrayOfObjectSchema = {
  addresses: {
    type: Array,
    group: addressGroup,
    ...permissions,
  },
  "addresses.$": {
    type: addressSchema,
  },
};
export const ArrayOfObjects = createDummyCollection(
  "ArrayOfObject",
  arrayOfObjectSchema
);
export const Objects = createDummyCollection("Object", objectSchema);
export const ArrayOfUrls = createDummyCollection(
  "ArrayOfUrl",
  arrayOfUrlSchema
);
export const ArrayOfCustomObjects = createDummyCollection(
  "ArrayOfCustomObject",
  arrayOfCustomObjectSchema
);
export const ArrayFullCustom = createDummyCollection(
  "ArrayFullCustom",
  arrayFullCustomSchema
);
// eslint-disable-next-line no-unused-vars
export const ArrayOfStrings = createDummyCollection(
  "ArrayOfString",
  arrayOfStringSchema
);

export const Addresses = createModel({
  name: "Addresses",
  //typeName: "Address",
  schema: addressSchema,
});

export const OneField = createModel({
  name: "OneField",
  schema: {
    text: {
      type: String,
      canRead: ["anyone"],
      canUpdate: ["anyone"],
      canCreate: ["anyone"],
    },
  },
});
