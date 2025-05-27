import { getNormResponsesCollection } from "@devographics/mongo";

const happinessFields = [
  // "front_end_frameworks",
  // "rendering_frameworks", // old name for meta_frameworks
  // "meta_frameworks",
  // "testing",
  // "mobile_desktop",
  // "build_tools",
  // "monorepo_tools",
  // "state_of_the_web",
  // "state_of_js",
  "state_of_css",
];
const tempPath = "convertHappinessTemp";

export const convertHappiness = async (args) => {
  const normalizedResponses = await getNormResponsesCollection();
  for (const sectionId of happinessFields) {
    const oldPath = `happiness.${sectionId}`;
    // while we're at it, let's migrate "rendering_frameworks" to "meta_frameworks"
    const newSectionId =
      sectionId === "rendering_frameworks" ? "meta_frameworks" : sectionId;
    const newPath = `happiness.${newSectionId}.choices`;

    console.log(`${oldPath} => ${newPath}`);

    // step 1: copy field value to new temporary path
    const result1 = await normalizedResponses.updateMany(
      {
        [oldPath]: { $exists: true },
        [newPath]: { $exists: false },
      },
      { $rename: { [oldPath]: tempPath } },
      {}
    );
    console.log(result1);

    // step 2: copy temporary value to final path
    const result2 = await normalizedResponses.updateMany(
      { [tempPath]: { $exists: true } },
      { $rename: { [tempPath]: newPath } }
    );
    console.log(result2);
  }
};

convertHappiness.args = [];

convertHappiness.description = `Convert normalized happiness from foo.happiness to foo.happiness.choices for all surveys`;

convertHappiness.deprecated = true;
