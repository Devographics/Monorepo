import { DynamicT, T } from "@devographics/react-i18n";
import s from "./GoalMeter.module.scss";

const GoalMeter = ({ progress, goal }: { progress: number; goal: number }) => {
  const percentage = progress / goal;
  const intl = new Intl.NumberFormat("en-US");
  return (
    <div className={s.goal_progress_block}>
      <h2 className={s.goal_progress_heading}>
        <T token="finish.goal_heading" />
      </h2>
      <p className={s.goal_progress_description}>
        <T token="finish.goal_heading.description" values={{ count: goal }} />
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
              <T token="finish.goal_currently" /> {intl.format(progress)}
            </div>
          </div>
        </div>
        <div
          className={s.goal_progress_marker_goal}
          style={{ "--percentage": 1 }}
        >
          <figure>{intl.format(goal)}</figure>
          <span>
            <T token="finish.goal_responses" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoalMeter;
