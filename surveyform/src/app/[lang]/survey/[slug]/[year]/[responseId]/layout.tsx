// TODO: technically, we don't need the "responseId" parameter
// the response can be retrieved given the current user
import { redirect } from "next/navigation";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { ResponseProvider } from "~/components/ResponseContext/ResponseProvider";
import { routes } from "~/lib/routes";

// Important, otherwise the page will use ISR
// https://github.com/vercel/next.js/issues/44712
export const dynamic = "force-dynamic";

export default async function WithResponseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { responseId: string };
}) {
  // pages below this layout require authentication
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    // TODO: use from, require to get current request URL
    return redirect(routes.account.login.href);
  }
  // TODO: get the response from server directly
  // instead of doing client-side data fetching
  // TODO: also check response access permissions!
  return (
    <ResponseProvider responseId={params.responseId}>
      {children}
    </ResponseProvider>
  );
}
