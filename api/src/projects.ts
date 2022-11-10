import { ProjectMongooseModel } from "@devographics/core-models/server";
import fetch from "node-fetch";

const formatId = (id: string) => id?.replaceAll("-", "_");

const idFieldName = "slug";

export const initProjects = async (context: any) => {
  const { db } = context
  const projectsCollection = db.collection('projects')

  console.log("// Adding Best of JS projects to DB…");
  await projectsCollection.deleteMany({});


  const response = await fetch(
    "https://bestofjs-static-api.vercel.app/projects-full.json"
  );
  const BestOfJSData: any = await response.json();
  const projectsData = BestOfJSData.projects.filter((p) => !!p[idFieldName]);

  // format all ids (- to _)
  let data = projectsData.map((project: any) => {
    return { ...project, id: formatId(project[idFieldName]) };
  });
  // TODO: filter out any project that is already in entities
  await projectsCollection.insertMany(data);
  console.log(`  -> Inserted ${projectsData.length} projects.`);
};
