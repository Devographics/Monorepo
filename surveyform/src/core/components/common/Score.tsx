import React, { useState, useRef } from "react";
import { getKnowledgeScore } from "~/modules/responses/helpers";
import get from "lodash/get.js";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import take from "lodash/take.js";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import type { SurveyType } from "@devographics/core-models";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useEntities } from "~/core/components/common/EntitiesContext";

const Features = ({
  features,
  limit,
}: {
  features: Array<any>;
  limit: any;
}) => {
  const limitedFeatures = take(features, limit);
  const Components = useVulcanComponents();
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
  const TagName = mdnUrl ? "a" : "span";

  return (
    <div className="score-feature">
      <TagName
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
const Score = ({ response, survey }: { response: any; survey: SurveyType }) => {
  const intl = useIntlContext();
  const Components = useVulcanComponents();
  const containerRef = useRef<HTMLInputElement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { knowledgeRanking } = response;
  const { known, total, score, unknownFields } = getKnowledgeScore(
    response
    //survey
  );
  const knowledgeRankingFromTop = knowledgeRanking;
  const { name, shareUrl, hashtag } = survey;

  const text = intl.formatMessage(
    { id: "thanks.share_score_message" },
    { score, name, shareUrl: `${shareUrl}?source=post_survey_share`, hashtag }
  );

  const unknownFieldIds = unknownFields
    .map((f) => f.id)
    .filter((id) => !!id) as Array<string>;

  const { data, loading: entitiesLoading, error } = useEntities();
  const { entities } = data;

  // if (loading) return <Components.Loading />;
  // if (error) return <span>Could not load entities</span>;

  // only keep features which have an associated entity which itself has a URL
  const unknownFeatures = unknownFields
    .map((field) => {
      const entity = entities?.find((e) => e.id === field.id);
      return {
        field,
        entity,
        url: entity?.mdn?.url,
      };
    })
    .filter((feature) => !!feature.url);

  return (
    <div className="score">
      <div className="score-calculation">
        <div className="score-calcuation-heading">
          <FormattedMessage id="thanks.knowledge_score" />
        </div>
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
          %
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
        </div>
        <div className="score-ratio">
          <FormattedMessage
            id="thanks.score_explanation"
            values={{ known, total, knowledgeRankingFromTop }}
          />
        </div>
        <div className="score-share">
          <Components.Button
            target="_blank"
            href={`https://twitter.com/intent/tweet/?text=${encodeURIComponent(
              text
            )}`}
          >
            <FormattedMessage id="thanks.share_on_twitter" />
          </Components.Button>
        </div>
        {unknownFeatures.length > 0 && (
          <Features features={unknownFeatures} limit={10} />
        )}
      </div>
    </div>
  );
};

export default Score;
