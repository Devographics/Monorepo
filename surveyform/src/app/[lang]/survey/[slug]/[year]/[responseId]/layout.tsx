import { redirect } from "next/navigation";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { NextLayoutParams } from "~/app/typings";
import { WithErrorCatcher } from "~/app/utils";
import { ResponseProvider } from "~/components/ResponseContext/ResponseProvider";
import { rscMustGetResponse } from "~/lib/responses/rsc-fetchers";
import { routes } from "~/lib/routes";

// Important, otherwise the page will use ISR
// https://github.com/vercel/next.js/issues/44712
export const dynamic = "force-dynamic";

export default WithErrorCatcher(async function ResponseLayout({
  children,
  params,
}: NextLayoutParams<{ slug: string; year: string; responseId: string }>) {
  const { slug, year, responseId } = params;
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    return redirect(routes.account.login.from(`/survey/${slug}/${year}`));
  }
  if (!responseId) {
    throw new Error("no responseId");
  }
  // technically, we don't need the "responseId" parameter
  // the response can be retrieved given the current user
  // but this RSC will also check if the response id/user matches
  // for clearer error messages
  const response = await rscMustGetResponse({
    currentUser,
    responseId,
  });
  // NOTE: this context is used only by client components
  return <ResponseProvider response={response}>{children}</ResponseProvider>;
});
