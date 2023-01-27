import { getNestedFieldSchemaOrType } from "../utils/schema_utils";

const addressSchema = {
  street: {
    type: String,
  },
  country: {
    type: String,
  },
};
const addressSimpleSchema = addressSchema;

describe("schema_utils", function () {
  describe("getNestedFieldSchemaOrType", function () {
    it("get nested schema of an array", function () {
      const simpleSchema = {
        addresses: {
          type: Array,
        },
        "addresses.$": {
          // this is due to SimpleSchema objects structure
          type: addressSimpleSchema,
        },
      };
      const nestedSchema = getNestedFieldSchemaOrType(
        "addresses",
        simpleSchema
      );
      if (!nestedSchema) throw new Error("Schema not found");
      // nestedSchema is a complex SimpleSchema object, so we can only
      // test its type instead (might not be the simplest way though)
      expect(Object.keys(nestedSchema)).toEqual(Object.keys(addressSchema));
    });
    it("get nested schema of an object", function () {
      const simpleSchema = {
        meetingPlace: {
          type: addressSimpleSchema,
        },
      };
      const nestedSchema = getNestedFieldSchemaOrType(
        "meetingPlace",
        simpleSchema
      );
      if (!nestedSchema) throw new Error("nested schema not found");
      expect(Object.keys(nestedSchema)).toEqual(Object.keys(addressSchema));
    });
    it("return null for other types", function () {
      const simpleSchema = {
        createdAt: {
          type: Date,
        },
      };
      const nestedSchema = getNestedFieldSchemaOrType(
        "createdAt",
        simpleSchema
      );
      expect(nestedSchema).toBeNull();
    });
  });
});
