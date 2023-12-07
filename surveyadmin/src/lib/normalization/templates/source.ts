import set from "lodash/set.js";
import get from "lodash/get.js";
import compact from "lodash/compact.js";
import { normalizeSingle } from "../normalize/helpers";
import { getQuestionRules } from "../normalize/getQuestionRules";
import { copyFields } from "../normalize/steps";
import { NormalizationParams } from "../types";
import { QuestionTemplateOutput } from "@devographics/types";

export const source = async (normalizationParams: NormalizationParams) => {
  await copyFields(normalizationParams);
  const { normResp, entityRules, survey, edition, verbose, timestamp } =
    normalizationParams;
  const normSource = await normalizeSource(
    normResp,
    entityRules,
    survey,
    edition,
    verbose,
    timestamp
  );
  if (normSource.raw) {
    set(normResp, "user_info.source.raw", normSource.raw);
  }
  if (normSource.id) {
    set(normResp, "user_info.source.normalized", normSource.id);
  }
  if (normSource.pattern) {
    set(normResp, "user_info.source.pattern", normSource.pattern.toString());
  }
  const fullPath = "user_info.source";
};

/*

Handle source normalization separately since its value can come from 
three different fields (source field, referrer field, 'how did you hear' field)

*/
export const normalizeSource = async (
  normResp,
  entityRules,
  survey,
  edition,
  verbose,
  timestamp
) => {
  const tags = [
    "sources",
    `sources_${survey.id}`,
    "surveys",
    "sites",
    "podcasts",
    "youtube",
    "socialmedia",
    "newsletters",
    "people",
    "courses",
  ];

  const questionObject = {
    id: "source",
    matchTags: tags,
  } as QuestionTemplateOutput;

  const rules = getQuestionRules({
    questionObject,
    entityRules,
    verbose,
  });

  const rawSource = get(normResp, "user_info.sourcetag");
  const rawFindOut = get(
    normResp,
    "user_info.how_did_user_find_out_about_the_survey"
  );

  const rawRef = get(normResp, "user_info.referrer");

  try {
    const normSource =
      rawSource &&
      (await normalizeSingle({
        values: [rawSource],
        entityRules,
        edition,
        questionObject: { id: "source" } as QuestionTemplateOutput,
        verbose,
        timestamp,
      }));
    const normFindOut =
      rawFindOut &&
      (await normalizeSingle({
        values: [rawFindOut],
        entityRules,
        edition,
        questionObject: {
          id: "how_did_user_find_out_about_the_survey",
        } as QuestionTemplateOutput,
        verbose,
        timestamp,
      }));
    const normReferrer =
      rawRef &&
      (await normalizeSingle({
        values: [rawRef],
        entityRules,
        edition,
        questionObject: { id: "referrer" } as QuestionTemplateOutput,
        verbose,
        timestamp,
      }));

    if (normSource) {
      return { ...normSource, raw: rawSource };
    } else if (normFindOut) {
      return { ...normFindOut, raw: rawFindOut };
    } else if (normReferrer) {
      return { ...normReferrer, raw: rawRef };
    } else {
      return { raw: compact([rawSource, rawFindOut, rawRef]).join(", ") };
    }
  } catch (error) {
    console.log(
      `// normaliseSource error for response ${normResp.responseId} with values ${rawSource}, ${rawFindOut}, ${rawRef}`
    );
    throw new Error(error);
  }
};
