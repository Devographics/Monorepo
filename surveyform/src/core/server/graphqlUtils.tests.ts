import gql from "graphql-tag";
import { getFragmentName } from "./graphqlUtils";

test("get fragment name", () => {
  expect(
    getFragmentName(
      gql`
        fragment Foo on Bar {
          hello
        }
      `
    )
  ).toEqual("Foo");
});
