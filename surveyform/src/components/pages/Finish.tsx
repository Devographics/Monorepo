import ShareSite from "../share/ShareSite";
import Score from "../common/Score";
import { getEditionTitle } from "~/lib/surveys/helpers/getEditionTitle";
import ReadingListResults from "~/components/reading_list/ReadingListResults";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { ThanksBackButton } from "./ThanksBackButton";
import { DynamicT } from "@devographics/react-i18n";
import { Button } from "../ui/Button";
import GoalMeter from "../common/GoalMeter";
// import { useCurrentUser } from "~/lib/users/hooks";
import { rscCurrentUser } from "~/lib/users/rsc-fetchers/rscCurrentUser";
import ChatAppShare from "../common/ChatAppShare";
import s from "./Finish.module.scss";
import { rscTotalResponses } from "~/lib/responses/stats";
import { getEditionImageUrl } from "@devographics/helpers";
import { publicConfig } from "~/config/public";

const goal = 1000;

export const Finish = async ({
  edition,
  response,
  readOnly,
}: {
  readOnly?: boolean;
  edition: EditionMetadata;
  response: ResponseDocument;
}) => {
  const currentUser = await rscCurrentUser();
  // const { currentUser, loading } = useCurrentUser();

  const imageUrl = getEditionImageUrl({
    edition,
    assetUrl: publicConfig.assetUrl || "",
  });

  const { survey, year } = edition;
  const { responsesGoal, enableGoal, enableScore } = edition;
  const { name } = survey;

  const currentProgressCount = await rscTotalResponses({ edition });
  const showGoal =
    enableGoal &&
    currentProgressCount !== undefined &&
    responsesGoal !== undefined;
  const featureSections = edition.sections.filter(
    (section) => section.slug === "features"
  );
  const showScore = enableScore && response && featureSections.length > 0;
  const enableReadingList = edition.enableReadingList;

  const trackingId = `user__${currentUser?._id?.slice(0, 5)}`;

  return (
    <div className={`${s.finish_page} contents-narrow thanks`}>
      <ThanksBackButton
        readOnly={readOnly}
        edition={edition}
        response={response}
      />
      {/* <div className="survey-message survey-finished">
        <DynamicT token="general.thanks1" />
      </div> */}

      {showScore && <Score response={response} edition={edition} />}

      <h1 className={`${s.finish_page_image} survey-image survey-image-small`}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={getEditionTitle({ edition })}
            //quality={100}
          />
        )}
      </h1>
      {/* <div>
        <DynamicT token="general.thanks2" />
      </div> */}
      {showGoal && (
        <GoalMeter
          edition={edition}
          progress={currentProgressCount}
          goal={responsesGoal}
        />
      )}

      <ChatAppShare edition={edition} />

      <ShareSite edition={edition} />

      {enableReadingList && response && (
        <ReadingListResults response={response} edition={edition} />
      )}
    </div>
  );
};

export default Finish;
