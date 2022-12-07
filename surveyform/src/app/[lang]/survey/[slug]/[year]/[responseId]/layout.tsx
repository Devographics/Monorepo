import { ResponseProvider } from "~/core/components/survey/ResponseContext/ResponseProvider";

// TODO: this should not be needed in the first place,
// we want this page to be dynamic
export async function generateStaticParams() {
  return [];
}
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
