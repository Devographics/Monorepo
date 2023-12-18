"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import Dialog from "./Dialog";
import {
  EditionMetadata,
  SurveyMetadata,
  Entity,
  QuestionWithSection,
} from "@devographics/types";
import LoadingButton from "../LoadingButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImportNormalizationArgs } from "~/lib/normalization/actions";
import { importNormalizations } from "~/lib/normalization/services";
import { getCustomNormalizationsCacheKey } from "./NormalizeQuestion";

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
  const [showImport, setShowImport] = useState(false);
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const commonParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };

  const mutation = useMutation({
    mutationFn: async (params: ImportNormalizationArgs) =>
      await importNormalizations(params),
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
      <a
        role={isButton ? "button" : "link"}
        className="view-import"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowImport(!showImport);
        }}
      >
        Import…
      </a>
      <Dialog
        showModal={showImport}
        setShowModal={setShowImport}
        header={
          <span>
            Import normalizations for <code>{question.id}</code>
          </span>
        }
      >
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
      </Dialog>
    </div>
  );
};
