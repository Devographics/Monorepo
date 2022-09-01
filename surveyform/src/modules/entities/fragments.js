
import { registerFragment } from 'meteor/vulcan:core';

registerFragment(/* GraphQL */ `
  fragment EntityFragment on Person {
    _id
    id
    name
  }
`);

