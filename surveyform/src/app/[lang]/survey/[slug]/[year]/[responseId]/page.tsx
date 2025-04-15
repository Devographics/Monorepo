import { redirect } from "next/navigation";

const SurveyFromResponseIdPage = async props => {
  const params = await props.params;
  // TODO: not sure if relative redirect is ok
  //redirect("./1");
  const { lang, slug, year, responseId } = params;
  redirect(`/${lang}/survey/${slug}/${year}/${responseId}/1`);
};

export default SurveyFromResponseIdPage;
