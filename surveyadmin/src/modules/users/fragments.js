import { extendFragment } from 'meteor/vulcan:core';

extendFragment(
  'UsersCurrent',
  /* GraphQL */`
  responses{
    _id
    surveySlug
    pagePath
  }
`
);