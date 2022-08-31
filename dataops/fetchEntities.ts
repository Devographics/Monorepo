// TODO: share types
type Entity = any;
/** Query sent to the translation API => load all entitites */
const entitiesQuery = `query EntitiesQuery {
  entities {
    id
    name
    tags
    type
    category
    description
    patterns
    apiOnly
    mdn {
      locale
      url
      title
      summary
    }
    twitterName
    twitter {
      userName
      avatarUrl
    }
    companyName
    company {
      name
      homepage {
        url
      }
    }
  }
}
`;
/**
 * Fetch raw entities from the translation API
 * @returns
 */
export const fetchEntities = async () => {
  const response = await fetch(process.env.TRANSLATION_API!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: entitiesQuery, variables: {} }),
  });
  const json = await response.json();
  if (json.errors) {
    console.log("// entities API query error");
    console.log(JSON.stringify(json.errors, null, 2));
    throw new Error();
  }
  const entities = json?.data?.entities as Array<Entity>;
  return entities;
};
