import React from "react";
import SurveySectionReadOnly from "./questions/SurveySectionReadOnly";
import SurveySection from "./questions/SurveySection";
import { useRouter } from "next/router.js";
import { useSurveyResponseParams } from "./hooks";

const SurveySectionSwitcher = () => {
  let { responseId, paramsReady } = useSurveyResponseParams();
  if (!paramsReady) return null;
  return responseId === "read-only" ? (
    <SurveySectionReadOnly />
  ) : (
    <SurveySection />
  );
};

export default SurveySectionSwitcher;
