import gql from "graphql-tag";

export const ProjectFragment = gql`
  fragment ProjectFragment on Project {
    _id
    id
    name
    npm
    github
    description
    homepage
  }
`;
