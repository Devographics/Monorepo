"use client";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { getFormPaths } from "@devographics/templates";
import {
  getAllResponsesSelector,
  getResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";
import { ActionProps } from "./NormalizeQuestionActions";
import ModalTrigger from "../ui/ModalTrigger";

type MetadataProps = ActionProps;
const Metadata = ({ survey, edition, question }: MetadataProps) => {
  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });

  const rawSelector = getResponsesSelector({
    edition,
    questionObject,
  });
  const normSelector = getAllResponsesSelector({
    edition,
    questionObject,
  });

  return (
    <ModalTrigger
      isButton={false}
      tooltip="View database info"
      header={
        <span>
          DB info for <code>{question.id}</code>
        </span>
      }
      label="🗃️ Database Info"
    >
      <div>
        <p>
          <ul>
            <li>
              Raw Path: <code>{formPaths?.other}</code>
            </li>
            <li>
              Selector: <textarea>{JSON.stringify(rawSelector)}</textarea>
            </li>
            <li>
              Normalized Path: <code>{questionObject?.normPaths?.other}</code>
            </li>
            <li>
              Selector: <textarea>{JSON.stringify(normSelector)}</textarea>
            </li>
            <li>
              Metadata Path: <code>{questionObject?.normPaths?.metadata}</code>
            </li>
          </ul>
        </p>
      </div>
    </ModalTrigger>
  );
};

export default Metadata;
