"use client";
import React, { useState, useRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { getKnowledgeScore } from "~/lib/responses/helpers";
import get from "lodash/get.js";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import take from "lodash/take.js";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { Button } from "~/components/ui/Button";
import { EditionMetadata } from "@devographics/types";
import { USED_PTS, HEARD_PTS } from "~/lib/responses/helpers";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const Features = ({
  features,
  limit,
}: {
  features: Array<any>;
  limit: any;
}) => {
  const limitedFeatures = take(features, limit);
  return (
    <div className="score-features">
      <h4 className="score-features-heading">
        <FormattedMessage id="thanks.learn_more_about" />
      </h4>{" "}
      <div className="score-features-items">
        {limitedFeatures.map((feature, i) => (
          <FeatureItem
            key={`${feature.id}_${i}`}
            feature={feature}
            showComma={i < limit - 1}
          />
        ))}
        .
      </div>
    </div>
  );
};

const FeatureItem = ({ feature, showComma }) => {
  const { entity } = feature;
  const mdnUrl = get(entity, "mdn.url");
  const TagWrapper = mdnUrl
    ? ({ children }) => <a>{children}</a>
    : ({ children }) => <span>{children}</span>;

  return (
    <div className="score-feature">
      <TagWrapper
        className="score-feature-name"
        {...(mdnUrl && {
          href: mdnUrl,
          target: "_blank",
          rel: "norefferer",
        })}
        dangerouslySetInnerHTML={{ __html: entity.nameClean || entity.name }}
      />
      {showComma && ", "}
      {/* <p className="score-feature-summary" dangerouslySetInnerHTML={{ __html: get(entity, 'mdn.summary') }} /> */}
    </div>
  );
};

const useRank = (score: number, editionId: string) => {
  return useSWR(apiRoutes.stats.rank.href({ score, editionId }));
};
const Score = ({
  response,
  edition,
}: {
  response: any;
  edition: EditionMetadata;
}) => {
  const intl = useIntlContext();
  const containerRef = useRef<HTMLInputElement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { known, total, score, usage, awareness } = getKnowledgeScore({
    response,
    edition,
  });
  const {
    data: dataRank,
    isLoading: rankLoading,
    error: rankError,
  } = useRank(score, edition.id);
  const rank = rankLoading
    ? "..."
    : rankError || !dataRank?.data
    ? 100
    : dataRank.data;

  const { survey, questionsUrl } = edition;
  const { name, hashtag } = survey;

  const text = intl.formatMessage({
    id: "thanks.share_score_message",
    values: {
      // TODO: at the time of writing (09/2023) translations include an additional %
      // need to check if we keep the % around
      score,
      name,
      shareUrl: `${questionsUrl}?source=post_survey_share`,
      hashtag,
      // not used by all translations
      awareness_count: awareness.count,
      usage_count: usage.count,
      rank,
    },
  });

  // if (loading) return <Components.Loading />;
  // if (error) return <span>Could not load entities</span>;

  // TODO
  // const entities: Array<any> = [];
  // only keep features which have an associated entity which itself has a URL
  // const unknownFeatures = unknownFields
  //   .map((field) => {
  //     const entity = entities?.find((e) => e.id === field.id);
  //     return {
  //       field,
  //       entity,
  //       url: entity?.mdn?.url,
  //     };
  //   })
  //   .filter((feature) => !!feature.url);

  return (
    <div
      className="score"
      style={
        {
          "--usage-ratio": usage.count / (usage.count + awareness.count),
        } as React.CSSProperties
      }
    >
      <div className="score-calculation">
        <div className="score-calcuation-heading">
          <FormattedMessage id="thanks.features_score" />
        </div>
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip>
              {usage.count}&times;{USED_PTS}{" "}
              <FormattedMessage
                id="thanks.points"
                className="score-suffix"
                defaultMessage="pts."
              />{" "}
              +&nbsp;
              {awareness.count}&times;{HEARD_PTS}{" "}
              <FormattedMessage
                id="thanks.point"
                className="score-suffix"
                defaultMessage="pt."
              />
            </Tooltip>
          }
        >
          <div className="score-percent">
            <CountUp
              start={0}
              delay={0.3}
              // @ts-ignore
              duration={2}
              end={score}
              onStart={() => {
                setTimeout(() => {
                  setShowConfetti(true);
                }, 1200);
              }}
            />

            <div className="score-confetti" ref={containerRef}>
              {showConfetti && containerRef.current && (
                <Confetti
                  width={containerRef.current.offsetWidth}
                  height={containerRef.current.offsetHeight}
                  recycle={false}
                  numberOfPieces={80}
                  initialVelocityX={5}
                  initialVelocityY={20}
                  confettiSource={{
                    x: containerRef.current.offsetWidth / 2 - 50,
                    y: 100,
                    w: 100,
                    h: 100,
                  }}
                />
              )}
            </div>
            <FormattedMessage
              id="thanks.points"
              className="score-suffix"
              defaultMessage="pts."
            />
          </div>
        </OverlayTrigger>
        <div className="score-ratio">
          <FormattedMessage
            id="thanks.score_statistics"
            values={{
              known,
              total: `<span class="score-number score-number-total">${total}</span>`,
              usage_total: `<span class="score-number score-number-total">${usage.total}</span>`,
              usage_count: `<span class="score-number score-number-counted used">${usage.count}</span>`,
              usage_score: `<span class="score-percentage used">${usage.score}%</span>`,
              awareness_total: awareness.total,
              awareness_count: `<span class="score-number score-number-counted heard">${awareness.count}</span>`,
              awareness_score: `<span class="score-percentage heard" title="${intl.formatMessage(
                {
                  id: "thanks.score_awareness_explanation",
                  values: { awareness_total: awareness.total },
                }
              )}">${awareness.score}%</span>`,
              knowledgeRankingFromTop: `<span class="score-number score-rank">${rank}%</span>`,
            }}
          />
        </div>
        <div className="score-share">
          <Button
            target="_blank"
            href={`https://twitter.com/intent/tweet/?text=${encodeURIComponent(
              text
            )}`}
          >
            <FormattedMessage id="thanks.share_on_twitter" />
          </Button>
        </div>
        {/* {unknownFeatures.length > 0 && (
          <Features features={unknownFeatures} limit={10} />
        )} */}
      </div>
    </div>
  );
};

export default Score;
