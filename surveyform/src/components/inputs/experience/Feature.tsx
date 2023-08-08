import Experience1, { ExperienceProps } from "./Experience";
import Experience2 from "./Experience2";

// split component in two while testing
// to test two possible UIs

const Experience = (props: ExperienceProps) => {
  if (props.question.template === "featureWithFollowups2") {
    return <Experience2 {...props} />;
  } else {
    return <Experience1 {...props} />;
  }
};

export default Experience;
