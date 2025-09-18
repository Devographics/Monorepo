"use client";

import { DynamicT, T, useI18n } from "@devographics/react-i18n";
import s from "./GoalMeter.module.scss";
import { EditionMetadata } from "@devographics/types";

const GoalMeter = ({
  edition,
  progress,
  goal,
}: {
  edition: EditionMetadata;
  progress: number;
  goal: number;
}) => {
  const { getMessage } = useI18n();
  const percentage = progress / goal;
  const intl = new Intl.NumberFormat("en-US");
  const messageKey = "finish.goal_heading.description";
  const regularMessage = getMessage(messageKey)?.t;
  const customMessageKey = `${messageKey}.${edition.id}`;
  const customMessage = getMessage(customMessageKey)?.t;

  const currentFormatted = intl.format(progress);
  const goalFormatted = intl.format(goal);
  return (
    <div className={s.goal_progress_block}>
      <h2 className={s.goal_progress_heading}>
        <T token="finish.goal_heading" />
      </h2>
      <p className={s.goal_progress_description}>
        <T token={customMessageKey} values={{ count: goalFormatted }}>
          <T token={messageKey} values={{ count: goalFormatted }} />
        </T>
      </p>
      <div className={s.goal_progress_outer}>
        <div className={s.goal_progress}>
          <div
            className={`goal_progress_inner ${s.goal_progress_inner}`}
            style={{ "--percentage": percentage }}
          />

          <div className={s.goal_progress_marker_wrapper}>
            <div
              className={s.goal_progress_marker_current}
              style={{ "--percentage": percentage }}
            >
              <T token="finish.goal_currently" /> {currentFormatted}
            </div>
          </div>
        </div>
        <div
          className={s.goal_progress_marker_goal}
          style={{ "--percentage": 1 }}
        >
          <span>
            <T token="finish.goal_goal" />
          </span>
          <figure>{goalFormatted}</figure>
          <span>
            <T token="finish.goal_responses" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoalMeter;
