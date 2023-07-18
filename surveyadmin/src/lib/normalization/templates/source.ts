import set from "lodash/set.js";
import get from "lodash/get.js";
import compact from "lodash/compact.js";
import { normalizeSingle } from "../normalize/helpers";
import { copyFields } from "../normalize/steps";
import { NormalizationParams } from "../types";

export const source = async (normalizationParams: NormalizationParams) => {
  await copyFields(normalizationParams);
  const { normResp, entityRules, survey, edition, verbose } =
    normalizationParams;
  const normSource = await normalizeSource(
    normResp,
    entityRules,
    survey,
    edition,
    verbose
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
  allRules,
  survey,
  edition,
  verbose
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
        value: rawSource,
        allRules,
        tags,
        edition,
        question: { id: "source" },
        verbose,
      }));
    const normFindOut =
      rawFindOut &&
      (await normalizeSingle({
        value: rawFindOut,
        allRules: allRules,
        tags,
        edition,
        question: { id: "how_did_user_find_out_about_the_survey" },
        verbose,
      }));
    const normReferrer =
      rawRef &&
      (await normalizeSingle({
        value: rawRef,
        allRules: allRules,
        tags,
        edition,
        question: { id: "referrer" },
        verbose,
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
