"use client";
import { useState } from "react";
import { loadQuestionData } from "~/lib/normalization/services";
import ModalTrigger from "../ui/ModalTrigger";
import {
  useQuery,
  // @ts-ignore
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { getData, getFrequencyCacheKey } from "./NormalizeQuestion";
import { apiRoutes } from "~/lib/apiRoutes";

export const WordFrequencies = (props) => {
  const { questionDataQuery, responses, survey, edition, question, entities } =
    props;
  const [loading, setLoading] = useState(false);
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

const FrequenciesData = (props) => {
  const { questionDataQuery, responses, survey, edition, question, entities } =
    props;
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
  const { frequencyData } = props;
  const { normalized, unnormalized, all } = frequencyData;
  console.log(frequencyData);
  return (
    <div className="word-frequencies-lists">
      <List list={all} label="All Answers" />
      <List list={normalized} label="Normalized Answers" />
      <List list={unnormalized} label="Unnormalized Answers" />
    </div>
  );
};

const List = ({ list, label }) => {
  return (
    <section>
      <h5>
        {label} ({list.length} words)
      </h5>
      <table>
        <tbody>
          {list.map((wordItem) => (
            <Word key={wordItem.word} wordItem={wordItem} />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Word = ({ wordItem }) => {
  const { word, count } = wordItem;
  return (
    <tr>
      <td>{word}</td>
      <td>{count}</td>
    </tr>
  );
};
