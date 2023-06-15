import { getProjectsCollection } from "@devographics/mongo";

export const searchProjects = async ({ query }: { query: string }) => {
  const Projects = await getProjectsCollection();
  const projectsCursor = Projects.find(
    {
      name: { $regex: query, $options: "i" },
    },
    { limit: 20 }
  );
  const projectsArray = await projectsCursor.toArray();

  const result = projectsArray.map(({ _id, name }) => ({
    id: _id,
    label: name,
  }));

  return result;
};
