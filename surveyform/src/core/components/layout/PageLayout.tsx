import type { ReactNode } from "react";

/**
 * Default layout, to be used in pages
 *
 */
interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => <div>{children}</div>;

/**
 * To be used in pages
 * @example  const MyPageComponent.getLayout = getDefaultPageLayout
 */
export const getDefaultPageLayout = function (page: ReactNode) {
  return <PageLayout>{page}</PageLayout>;
};

export default PageLayout;
