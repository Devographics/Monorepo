const getUrl = (path) =>
  `${process.env.API_URL?.replace("/graphql", "")}/${path}?key=${
    process.env.SECRET_KEY
  }`;

const reload = async (path) => {
  const url = getUrl(path);
  console.log("// reload");
  console.log(path);
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
  });
  const result = await response.text();
  console.log(result);
  return { result, url };
};

export const reloadAPISurveys = async () => {
  return await reload("reinitialize-surveys");
};

export const reloadAPILocales = async () => {
  return await reload("reinitialize-locales");
};

export const reloadAPIEntities = async () => {
  return await reload("reinitialize-entities");
};
