"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import Dialog from "../ui/Dialog";
import {
  EditionMetadata,
  SurveyMetadata,
  Entity,
  QuestionWithSection,
} from "@devographics/types";
import LoadingButton from "../LoadingButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImportNormalizationArgs } from "~/lib/normalization/actions";
import { importNormalizationsJSON } from "~/lib/normalization/services";
import { getCustomNormalizationsCacheKey } from "./NormalizeQuestion";
import ModalTrigger from "../ui/ModalTrigger";

export const Import = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
  isButton?: boolean;
}) => {
  const { survey, edition, question, entities, isButton = true } = props;
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const commonParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };

  const mutation = useMutation({
    mutationFn: async (params: ImportNormalizationArgs) =>
      await importNormalizationsJSON(params),
    onSuccess: (data, variables) => {
      console.log(data);
      queryClient.setQueryData(
        [getCustomNormalizationsCacheKey(commonParams)],
        (previous) => {
          //   return updateCustomNormalization(previous, data, variables, action);
        }
      );
    },
  });

  return (
    <div>
      <ModalTrigger
        isButton={false}
        label="📥 Import"
        tooltip="Import JSON normalizations"
        header={
          <span>
            Import normalizations for <code>{question.id}</code>
          </span>
        }
      >
        <>
          <h1>Import</h1>
          <textarea
            onChange={(e) => {
              setValue(e.target.value);
            }}
          >
            {value}
          </textarea>
          <LoadingButton
            action={async () => {
              const result = await mutation.mutateAsync({
                ...commonParams,
                data: value,
                rawPath: "unknown",
              });
              return result;
            }}
            label="Submit"
            tooltip="Import Normalizations"
          />
          <hr />
          <p>
            <h4>JSON Example</h4>
            <pre>
              <code>
                {`{
  "_metadata": {
    "source": "chatgpt",
    "exportedAt": "Thu Oct 23 2025 10:33:25 GMT+0900 (Japan Standard Time)",
  },
  "tokens": {
    "accuracy_issues": "accuracy_issues",
    "hallucination": "hallucination",
    "understanding_issues": "understanding_issues"
  },
  "matches": [
    {
      "index": 1,
      "answer": "o3-mini and 4o are horrible at making websites",
      "answerId": "TmBZzUTTiF6v3VQThbDhq___performance_issues___0",
      "tokenIds": [
        "accuracy_issues"
      ]
    },
    {
      "index": 2,
      "answer": "Unnecessarily long answers; Instead of answering code questions it copy pastes the whole file as a reply",
      "answerId": "31NfL1eR-0yBEjvtyQsSH___performance_issues___1",
      "tokenIds": [
        "verbosity_formatting",
        "code_modification_behavior",
        "understanding_issues"
      ]
    }
  ]
}`}
              </code>
            </pre>
          </p>
        </>
      </ModalTrigger>
    </div>
  );
};
