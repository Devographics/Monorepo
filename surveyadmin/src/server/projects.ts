import { getProjectsCollection, newMongoId } from "@devographics/mongo";
// import projectsData from "~/data/js/projects";
import fetch from "node-fetch";

const replaceAll = function (target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
};

const formatId = (id: string) => id && replaceAll(id, "-", "_");

const idFieldName = "slug";

export const loadProjects = async () => {
  console.log("// Adding Best of JS projects to DB…");
  const Projects = await getProjectsCollection()
  await Projects.deleteMany({});

  const response = await fetch(
    "https://bestofjs-static-api.vercel.app/projects-full.json"
  );
  const BestOfJSData: any = await response.json();
  const projectsData = BestOfJSData.projects.filter((p) => !!p[idFieldName]);

  // format all ids (- to _)
  let data = projectsData.map((project) => {
    return {
      ...project,
      // be careful to use string ids in mongo
      _id: newMongoId(),
      id: formatId(project[idFieldName])
    };
  });
  // TODO: filter out any project that is already in entities
  await Projects.insertMany(data);
  console.log(`  -> Inserted ${projectsData.length} projects.`);
};
