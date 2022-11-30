import SurveyPageComponent from "~/core/components/survey/page/SurveyPage";

interface SurveyPageServerProps {
  slug?: string;
  year?: string;
}
export default function SurveyPage({ slug, year }: SurveyPageServerProps) {
  return <SurveyPageComponent slug={slug} year={year} />;
}
