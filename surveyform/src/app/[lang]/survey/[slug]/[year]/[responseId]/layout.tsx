// TODO: technically, we don't need the "responseId" parameter
// the response can be retrieved given the current user
import { redirect } from "next/navigation";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { ResponseProvider } from "~/components/ResponseContext/ResponseProvider";
import { rscMustGetResponse } from "~/lib/responses/rsc-fetchers";
import { routes } from "~/lib/routes";

// Important, otherwise the page will use ISR
// https://github.com/vercel/next.js/issues/44712
export const dynamic = "force-dynamic";

export default async function WithResponseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string; year: string; responseId: string };
}) {
  const { slug, year, responseId } = params;
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    return redirect(routes.account.login.from(`/survey/${slug}/${year}`));
  }
  const response = await rscMustGetResponse({
    currentUser,
    responseId,
  });
  return <ResponseProvider response={response}>{children}</ResponseProvider>;
}
