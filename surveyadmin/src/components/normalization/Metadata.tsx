"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { getFormPaths } from "@devographics/templates";
import {
  getAllResponsesSelector,
  getResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";
import Dialog from "./Dialog";
import { ActionProps } from "./NormalizeQuestionActions";

type MetadataProps = ActionProps;
const Metadata = ({ survey, edition, question }: MetadataProps) => {
  const [showDbInfo, setShowDbInfo] = useState(false);

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
    <div>
      <a
        role="button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowDbInfo(!showDbInfo);
        }}
      >
        Metadata
      </a>
      <Dialog
        showModal={showDbInfo}
        setShowModal={setShowDbInfo}
        header={
          <span>
            DB info for <code>{question.id}</code>
          </span>
        }
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
                Metadata Path:{" "}
                <code>{questionObject?.normPaths?.metadata}</code>
              </li>
            </ul>
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default Metadata;
