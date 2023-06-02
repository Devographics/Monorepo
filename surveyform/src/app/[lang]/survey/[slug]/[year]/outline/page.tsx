import { redirect } from "next/navigation";

const SurveyFromResponseIdPage = ({ params }) => {
  // TODO: seems unreliable, why?
  //redirect("./1");
  redirect(`/${params.lang}/survey/${params.slug}/${params.year}/outline/1`);
};

export default SurveyFromResponseIdPage;
