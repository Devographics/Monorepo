import { ProjectsMongoCollection } from "~/modules/projects/model.server";

/*

Take a query string and find matching projects
(used for autocompleting based on a partial query string)

*/
export const projectsAutocomplete = async (root, args, context) => {
  const queryString = args?.input?.filter?.name?._like;

  const Projects = ProjectsMongoCollection();
  const projectsCursor = await Projects.find({
    name: { $regex: queryString, $options: "i" },
  }).limit(20);
  const projectsArray = await projectsCursor.toArray();

  const result = {
    results: projectsArray.map(({ _id, name }) => ({ _id, name })),
  };

  return result;
};

/*

Take a list of _ids and find matching projects
(used when we already have _ids and want to display labels for better UX)

*/
export const projectsLabels = async (root, args, context) => {
  const ids = args?.input?.filter?._id?._in;

  const Projects = ProjectsMongoCollection();
  const projectsCursor = await Projects.find({
    _id: { $in: ids },
  });
  const projectsArray = await projectsCursor.toArray();

  const result = {
    results: projectsArray.map(({ _id, name }) => ({ _id, name })),
  };

  return result;
};
