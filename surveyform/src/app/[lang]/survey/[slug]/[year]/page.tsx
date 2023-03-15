import SurveyPageComponent from "~/surveys/components/page/SurveyPage";

interface SurveyPageServerProps {
  slug?: string;
  year?: string;
}
export default function SurveyPage({
  params: { slug, year },
}: {
  params: SurveyPageServerProps;
}) {
  return (
    <SurveyPageComponent /*NOTE: currently it's a client component 
  so it gets the survey via client context instead of props*/
    />
  );
}
