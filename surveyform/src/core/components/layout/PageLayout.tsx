import { ReactElement } from "react";

/**
 * Default layout, to be used in pages
 *
 */
interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => <div>{children}</div>;

/**
 * To be used in pages
 * @example  const MyPageComponent.getLayout = getDefaultPageLayout
 */
export const getDefaultPageLayout = function (page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default PageLayout;
