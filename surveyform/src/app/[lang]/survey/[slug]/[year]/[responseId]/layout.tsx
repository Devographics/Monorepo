import { redirect } from "next/navigation";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { NextLayoutParams } from "~/app/typings";
import { ResponseProvider } from "~/components/ResponseContext/ResponseProvider";
import { rscMustGetResponse } from "~/lib/responses/rsc-fetchers";
import { routes } from "~/lib/routes";
import { RscError } from "~/lib/rsc-error";

// Important, otherwise the page will use ISR
// https://github.com/vercel/next.js/issues/44712
export const dynamic = "force-dynamic";

function WithErrorCatcher(rsc: any) {
  return async (...args: any) => {
    try {
      return await rsc(...args);
    } catch (err) {
      if (err instanceof RscError) {
        return err.render();
      }
      // uncatched error
      throw err;
    }
  };
}

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
  // TODO: technically, we don't need the "responseId" parameter
  // the response can be retrieved given the current user
  const response = await rscMustGetResponse({
    currentUser,
    responseId,
  });
  return <ResponseProvider response={response}>{children}</ResponseProvider>;
});
