import { createModel } from "@vulcanjs/model";
import { isMemberOf } from "./permissions";
import {
  checkFields,
  getDocumentBasedPermissionFieldNames,
  getUserReadableFields,
  restrictViewableFields,
  owns,
} from "../permissions/permissions";

describe("isMemberOf", () => {
  test("null user (visitor)", () => {
    expect(isMemberOf(null, ["anyone"], null)).toBe(true);
    expect(isMemberOf(null, ["guests"], null)).toBe(true);
    expect(isMemberOf(null, ["visitors"], null)).toBe(true);
    expect(isMemberOf(null, ["members"], null)).toBe(false);
    expect(isMemberOf(null, ["customGroup"], null)).toBe(false);
    expect(isMemberOf(null, ["admins"], null)).toBe(false);
  });
  test("logged in user (member)", () => {
    const user = { _id: "42", groups: [] };
    expect(isMemberOf(user, ["anyone"], null)).toBe(true);
    expect(isMemberOf(user, ["guests"], null)).toBe(true);
    expect(isMemberOf(user, ["visitors"], null)).toBe(false);
    expect(isMemberOf(user, ["members"], null)).toBe(true);
    expect(isMemberOf(user, ["customGroup"], null)).toBe(false);
    expect(isMemberOf(user, ["admins"], null)).toBe(false);
  });
  test("admin", () => {
    const user = { _id: "42", groups: [], isAdmin: true };
    expect(isMemberOf(user, ["anyone"], null)).toBe(true);
    expect(isMemberOf(user, ["guests"], null)).toBe(true);
    expect(isMemberOf(user, ["visitors"], null)).toBe(false);
    expect(isMemberOf(user, ["members"], null)).toBe(true);
    expect(isMemberOf(user, ["customGroup"], null)).toBe(false);
    expect(isMemberOf(user, ["admins"], null)).toBe(true);
  });
  test("custom group", () => {
    const user = { _id: "42", groups: ["customGroup"] };
    expect(isMemberOf(user, ["anyone"], null)).toBe(true);
    expect(isMemberOf(user, ["guests"], null)).toBe(true);
    expect(isMemberOf(user, ["visitors"], null)).toBe(false);
    expect(isMemberOf(user, ["members"], null)).toBe(true);
    expect(isMemberOf(user, ["customGroup"], null)).toBe(true);
    expect(isMemberOf(user, ["admins"], null)).toBe(false);
  });
});
describe("vulcan:users/permissions", () => {
  const Dummies = createModel({
    name: "Dummy",
    schema: {
      guestField: {
        type: String,
        canRead: ["anyone"],
      },
      adminField: {
        type: String,
        canRead: ["admins"],
      },
      ownerField: {
        type: String,
        canRead: ["owners"], // => need a document to be passed in order to check if the field is readable/filterable
      },
      customField: {
        type: String,
        canRead: [(document) => document && document.canRead], // => need a document to be passed in order to check if the field is readable/filterable
      },
    },
  });
  describe("getUserReadableFields", () => {
    test("getReadableFields", () => {
      const fields = getUserReadableFields(null, Dummies);
      expect(fields).toEqual(["guestField"]);
    });
    test("getReadableFields with document-based permissions excludes ambiguous fields", () => {
      const fields = getUserReadableFields(null, Dummies);
      expect(fields).not.toContain("ownerField");
      expect(fields).not.toContain("customField");
    });
  });

  describe("fields allowed for filtering", () => {
    test("get fields that needs to be checked against the document to be tested", () => {
      const documentBasedPermissionFields =
        getDocumentBasedPermissionFieldNames(Dummies);
      expect(documentBasedPermissionFields).toContain("ownerField");
      expect(documentBasedPermissionFields).toContain("customField");
    });
    test("checkFields throw on wrong permission", () => {
      expect(() => checkFields(null, Dummies, ["adminField"])).toThrow();
      expect(checkFields(null, Dummies, ["guestField"])).toBe(true);
    });
    test("checkFields with document-based permissions do not throw for ambigous fields (those field need the document to be checked)", () => {
      const res = checkFields(null, Dummies, [
        "guestField",
        "ownerField",
        "customField",
      ]);
      expect(res).toEqual(true);
    });
  });

  describe("restrictViewableFields", () => {
    test("restrictViewableFields", () => {
      const fields = restrictViewableFields(null, Dummies, {
        adminField: "foo",
        guestField: "bar",
      });
      expect(fields).toEqual({ guestField: "bar" });
    });

    describe("nested fields", () => {
      test("remove unreadable field of nested object", () => {
        const Dummies = createModel({
          name: "Dummy",
          schema: {
            nested: {
              canRead: ["anyone"],
              type: {
                ok: {
                  type: String,
                  canRead: ["anyone"],
                },
                nok: {
                  type: String,
                  canRead: ["members"],
                },
              },
            },
          },
        });
        const fields = restrictViewableFields(null, Dummies, {
          nested: { ok: "foo", nok: "bar" },
        });
        expect(fields).toEqual({ nested: { ok: "foo" } });
      });
      test("remove unreadable field of array of nested objects", () => {
        const Dummies = createModel({
          name: "Dummy",
          schema: {
            array: {
              type: Array,
              canRead: ["anyone"],
            },
            "array.$": {
              canRead: ["anyone"],
              type: {
                ok: {
                  type: String,
                  canRead: ["anyone"],
                },
                nok: {
                  type: String,
                  canRead: ["members"],
                },
              },
            },
          },
        });
        const fields = restrictViewableFields(null, Dummies, {
          array: [{ ok: "foo", nok: "bar" }],
        });
        expect(fields).toEqual({ array: [{ ok: "foo" }] });
      });
      test("ignore fields without read permission (parent permissions are used)", () => {
        const Dummies = createModel({
          name: "Dummy",
          schema: {
            nested: {
              canRead: ["anyone"],
              type: {
                ok: {
                  type: String,
                },
                nok: {
                  type: String,
                  canRead: ["members"],
                },
              },
            },
          },
        });
        const fields = restrictViewableFields(null, Dummies, {
          nested: { ok: "foo", nok: "bar" },
        });
        expect(fields).toEqual({ nested: { ok: "foo" } });
      });
    });
  });
  const document = {
    _id: "123",
    userId: "foo",
  };
  const rightUser = {
    _id: "foo",
    groups: [],
    isAdmin: false,
  };
  const wrongUser = {
    _id: "bar",
    groups: [],
    isAdmin: false,
  };

  describe("owns", () => {
    test("owns returns true when it's the right couple user-document", () => {
      const value = owns(rightUser, document);
      expect(value).toBe(true);
    });
    test("owns returns false when it's the a wrong couple user-document", () => {
      const value = owns(wrongUser, document);
      expect(value).toBe(false);
    });
  });
});
