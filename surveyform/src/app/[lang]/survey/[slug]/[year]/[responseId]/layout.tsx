import { ResponseProvider } from "~/core/components/survey/ResponseContext/ResponseProvider";

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
  // TODO: we could fetch the response here and pass it as context
  // instead of doing client-side data fetching
  return (
    <ResponseProvider response={{ id: params.responseId }}>
      {children}
    </ResponseProvider>
  );
}
