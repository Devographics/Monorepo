import { EditionProvider } from "~/components/SurveyContext/Provider";
import { rscEditionMetadataAdmin } from "~/fetchers/rscEditionMetadata";

export default async function EditionLayout(props) {
  const params = await props.params;

  const {
    surveyId,
    editionId
  } = params;

  const {
    children
  } = props;

  const { survey, edition } = await rscEditionMetadataAdmin({
    surveyId,
    editionId,
  });
  return (
    <EditionProvider survey={survey} edition={edition}>
      {children}
    </EditionProvider>
  );
}
