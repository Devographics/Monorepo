"use client";
import ModalTrigger from "../ui/ModalTrigger";
import { useQuery } from "@tanstack/react-query";
import {
  AnswerVariant,
  getData,
  getFrequencyCacheKey,
} from "./NormalizeQuestion";
import { apiRoutes } from "~/lib/apiRoutes";
import { ActionProps } from "./NormalizeQuestionActions";
import { FrequencyItem } from "~/lib/normalization/actions/getWordFrequencies";
import { Dispatch, SetStateAction } from "react";

export const WordFrequencies = (props: ActionProps) => {
  return (
    <ModalTrigger
      isButton={false}
      label="🔢 Word Frequencies…"
      tooltip="View word frequencies for current question"
      header={
        <div>
          Word Frequencies
          {/* <a
            role="button"
            href="#"
            aria-busy={loading}
            onClick={async (e) => {
              setLoading(true);
              e.preventDefault();
              await loadQuestionData({
                surveyId: survey.id,
                editionId: edition.id,
                sectionId: question.section.id,
                questionId: question.id,
                shouldGetFromCache: false,
              });
              setLoading(false);
            }}
          >
            Refresh
          </a> */}
        </div>
      }
    >
      <FrequenciesData {...props} />
    </ModalTrigger>
  );
};

const FrequenciesData = (props: ActionProps) => {
  const {
    questionDataQuery,
    responses,
    survey,
    edition,
    question,
    entities,
    setFilterQuery,
  } = props;
  const params = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };
  const frequencyQuery = useQuery({
    queryKey: [getFrequencyCacheKey(params)],
    queryFn: () =>
      getData(apiRoutes.normalization.loadWordFrequencies.href(params)),
  });
  const loading = frequencyQuery.isPending;
  return loading ? (
    <div aria-busy={true} />
  ) : (
    <Frequencies {...props} frequencyData={frequencyQuery.data} />
  );
};

const Frequencies = (props) => {
  return (
    <div className="word-frequencies-lists">
      {/* <List variant={"all"} label="All Answers" {...props} /> */}
      <List {...props} variant="normalized" label="Normalized Answers" />
      <List {...props} variant="unnormalized" label="Unnormalized Answers" />
    </div>
  );
};

const List = ({
  frequencyData,
  variant,
  label,
  setFilterQuery,
  setShowModal,
}) => {
  const list = frequencyData[variant];
  return (
    <section>
      <h5>
        {label} ({list.length} words)
      </h5>
      <table>
        <tbody>
          {list.map((wordItem) => (
            <Word
              listLabel={label}
              key={wordItem.word}
              wordItem={wordItem}
              setFilterQuery={setFilterQuery}
              setShowModal={setShowModal}
              variant={variant}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Word = ({
  listLabel,
  wordItem,
  setFilterQuery,
  setShowModal,
  variant,
}: {
  listLabel: string;
  wordItem: FrequencyItem;
  setFilterQuery: ActionProps["setFilterQuery"];
  setShowModal: Dispatch<SetStateAction<boolean>>;
  variant: AnswerVariant;
}) => {
  const { word, count } = wordItem;
  return (
    <tr>
      <td>
        <a
          data-tooltip={`Filter ${listLabel} by “${word}”`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setFilterQuery(word, variant);
            setShowModal(false);
          }}
        >
          {word}
        </a>
      </td>
      <td>{count}</td>
    </tr>
  );
};
