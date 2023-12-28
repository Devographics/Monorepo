import { EditionProvider } from "~/components/SurveyContext/Provider";
import { rscEditionMetadataAdmin } from "~/fetchers/rscEditionMetadata";

export default async function EditionLayout({
  children,
  params: { surveyId, editionId },
}) {
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
