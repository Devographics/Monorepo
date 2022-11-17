import mongoose from "mongoose";

type ProjectDocument = any;

export const ProjectsMongoCollection = () => {
  if (!mongoose.connection.db) {
    throw new Error(
      "Trying to access Response mongo collection before Mongo/Mongoose is connected."
    );
  }
  return mongoose.connection.db.collection<ProjectDocument>("projects");
};
