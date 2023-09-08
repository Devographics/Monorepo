const getUrl = (path, apiUrl) =>
  `${apiUrl?.replace("/graphql", "")}/${path}?key=${process.env.SECRET_KEY}`;

const reload = async (path, args) => {
  const { target } = args;
  const apiUrl =
    target === "production"
      ? process.env.API_URL_PRODUCTION
      : process.env.API_URL;
  if (!apiUrl) throw new Error("API_URL or API_URL_PRODUCTION is not defined")
  const url = getUrl(path, apiUrl);
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

export const reloadAPISurveys = async (args) => {
  return await reload("reinitialize-surveys", args);
};

export const reloadAPILocales = async (args) => {
  return await reload("reinitialize-locales", args);
};

export const reloadAPIEntities = async (args) => {
  return await reload("reinitialize-entities", args);
};
