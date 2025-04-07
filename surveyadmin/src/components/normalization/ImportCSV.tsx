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
import { importNormalizationsCSV } from "~/lib/normalization/services";
import { getCustomNormalizationsCacheKey } from "./NormalizeQuestion";
import ModalTrigger from "../ui/ModalTrigger";

export const Import = ({
  survey,
  edition,
  question,
  entities,
  isButton = true,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
  isButton?: boolean;
}) => {
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const commonParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };

  const mutation = useMutation({
    mutationFn: async (params: ImportNormalizationArgs) =>
      await importNormalizationsCSV(params),
    onSuccess: (data, variables) => {
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
        tooltip="Import CSV normalizations"
        header={
          <span>
            Import normalizations for <code>{question.id}</code>
          </span>
        }
      >
        <>
          <p>
            Format: CSV with two columns, <code>rawValue</code> and{" "}
            <code>entityId</code>
          </p>
          <textarea
            onChange={(e) => {
              setValue(e.target.value);
            }}
          >
            {value}
          </textarea>
          <LoadingButton
            action={async () => {
              await mutation.mutateAsync({
                ...commonParams,
                data: value,
              });
            }}
            label="Submit"
            tooltip="Import Normalizations"
          />
        </>
      </ModalTrigger>
    </div>
  );
};
