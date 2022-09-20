import { ProjectMongooseModel } from "@devographics/core-models/server";
// import projectsData from "~/data/js/projects";
import fetch from "node-fetch";
import { connectToAppDb } from "~/lib/server/mongoose/connection";

const replaceAll = function (target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
};

const formatId = (id) => id && replaceAll(id, "-", "_");

const idFieldName = "slug";

export const loadProjects = async () => {
  await connectToAppDb();
  console.log("// Adding Best of JS projects to DB…");
  await ProjectMongooseModel.deleteMany({});

  const response = await fetch(
    "https://bestofjs-static-api.vercel.app/projects-full.json"
  );
  const BestOfJSData: any = await response.json();
  const projectsData = BestOfJSData.projects.filter((p) => !!p[idFieldName]);

  // format all ids (- to _)
  let data = projectsData.map((project) => {
    return { ...project, id: formatId(project[idFieldName]) };
  });
  // TODO: filter out any project that is already in entities
  await ProjectMongooseModel.insertMany(data);
  console.log(`  -> Inserted ${projectsData.length} projects.`);
};
