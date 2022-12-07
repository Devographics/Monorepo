export async function generateStaticParams() {
  return [];
}
export default async function WithResponseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: [];
}) {
  // TODO: we could fetch the response here and pass it as context
  // instead of doing client-side data fetching
  return <>{children}</>;
}
