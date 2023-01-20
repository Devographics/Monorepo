import React from "react";
import { useCreate, useUpdate, useUpsert, useDelete } from "../index";
import {
  //multiQueryUpdater,
  buildCreateQuery,
} from "../create";
import { buildUpdateQuery } from "../update";
import { buildUpsertQuery } from "../upsert";
import { buildDeleteQuery } from "../delete";
// import sinon from "sinon";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { renderHook, act } from "@testing-library/react-hooks";
import { createGraphqlModel } from "@vulcanjs/graphql";

const test = it;

describe("react-hooks/mutations", () => {
  const typeName = "Foo";
  const multiTypeName = "Foos";
  const Foo: VulcanGraphqlModel = createGraphqlModel({
    name: "Foo",
    schema: {
      id: {
        type: String,
        canRead: ["guests"],
      },
      hello: {
        type: String,
        canRead: ["guests"],
      },
    },
    graphql: {
      typeName,
      multiTypeName,
    },
  });
  const fragment = Foo.graphql.defaultFragment;
  const fragmentName = Foo.graphql.defaultFragmentName;
  const rawFoo = { hello: "world" };
  const foo = { _id: 1, hello: "world" };
  const fooWithTypename = { _id: 1, hello: "world", __typename: "Foo" };
  const fooUpdate = { _id: 1, hello: "bar" };
  const fooUpdateWithTypename = { ...fooWithTypename, ...fooUpdate };
  describe("exports", () => {
    test("export hooks and hocs", () => {
      expect(useCreate).toBeInstanceOf(Function);
      expect(useUpdate).toBeInstanceOf(Function);
      expect(useUpsert).toBeInstanceOf(Function);
      expect(useDelete).toBeInstanceOf(Function);
    });
  });

  const hooksTest: Array<
    [string, Function, MockedResponse, Object, Object, Object]
  > = [
    [
      "create",
      useCreate,
      // mock response
      {
        request: {
          query: buildCreateQuery({ model: Foo, fragmentName, fragment }),
          variables: {
            input: {
              data: rawFoo,
            },
          },
        },
        result: {
          data: {
            createFoo: {
              data: fooWithTypename,
            },
          },
        },
      },
      // mutation cb input
      { input: { data: rawFoo } },
      // expected data
      { createFoo: { data: fooWithTypename } },
      // expected document
      fooWithTypename,
    ],
    [
      "update",
      useUpdate,
      {
        request: {
          query: buildUpdateQuery({ model: Foo, fragmentName, fragment }),
          variables: {
            //selector: { documentId: foo._id },
            input: {
              data: fooUpdate,
            },
          },
        },
        result: {
          data: {
            updateFoo: {
              data: fooUpdateWithTypename,
            },
          },
        },
      },
      { input: { data: fooUpdate } },
      { updateFoo: { data: fooUpdateWithTypename } },
      fooUpdateWithTypename,
    ],
    [
      "upsert",
      useUpsert,
      {
        request: {
          query: buildUpsertQuery({ typeName, fragmentName, fragment }),
          variables: {
            input: {
              data: fooUpdate,
            },
          },
        },
        result: {
          data: {
            upsertFoo: {
              data: fooUpdateWithTypename,
            },
          },
        },
      },
      { input: { data: fooUpdate } },
      { upsertFoo: { data: fooUpdateWithTypename } },
      fooUpdateWithTypename,
    ],
    [
      "delete",
      useDelete,
      {
        request: {
          query: buildDeleteQuery({ model: Foo, fragment, fragmentName }),
          variables: {
            input: {
              data: foo,
            },
          },
        },
        result: {
          data: {
            deleteFoo: {
              data: fooWithTypename,
            },
          },
        },
      },
      {
        input: { data: foo },
      },
      {
        deleteFoo: { data: fooWithTypename },
      },
      fooWithTypename,
    ],
  ];

  describe("hooks", () => {
    test.each(hooksTest)(
      "run %s mutation",
      async (
        mutationName,
        hook,
        mock,
        cbInput,
        expectedData,
        expectedDocument
      ) => {
        const mocks = [mock, mock, mock];
        const wrapper = ({ children }) => (
          <MockedProvider addTypename={false} mocks={mocks}>
            {children}
          </MockedProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
          () => hook({ model: Foo }),
          { wrapper }
        );

        const callback = result.current[0];
        let mutationResult = result.current[1];
        expect(mutationResult.loading).toEqual(false);
        await act(async () => {
          const cbResult = await callback(cbInput);
          expect(cbResult.data).toEqual(expectedData);
          expect(cbResult.document).toEqual(expectedDocument);
        });
      }
    );
  });
});
