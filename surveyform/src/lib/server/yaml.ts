import yaml from "js-yaml";
import { promises as fs } from "fs";
import path from "path";

const surveyDirPath = path.resolve(__dirname, "~/surveys/");

export const convertYAMLDir = async (dirPath) => {
  try {
    await fs.access(surveyDirPath);
  } catch (err) {
    throw new Error(
      `Path to surveys "${surveyDirPath}" is incorrect or cannot be accessed.`
    );
  }
  const yamlPath = dirPath + "/yml";
  const jsPath = dirPath + "/js";
  const fileNames = await fs.readdir(yamlPath);
  for (const fileName of fileNames) {
    const yamlData = await fs.readFile(yamlPath + "/" + fileName, "utf8");

    // @ts-ignore
    const json = yaml.load(yamlData, "utf8");
    const jsonString = JSON.stringify(json, null, 2);
    const jsContents = `
/* Generated automatically, do not modify */
export default ${jsonString}
`;
    await fs.writeFile(
      jsPath + "/" + fileName.replace(".yml", ".js"),
      jsContents,
      "utf8"
    );
  }
};

export const convertAllYAML = async () => {
  // await convertYAMLDir(i18nCommon)
  // await convertYAMLDir(i18nCSS)
  // await convertYAMLDir(i18nJS)
  await convertYAMLDir(surveyDirPath);
  // await convertYAMLDir(dataDirPath)
};
