import { getLocaleStaticProps } from "~/i18n/server/ssr";

export const MaintenancePage = () => {
  return <div>Sorry, this application is currently under maintenance. Follow <a href="https://twitter.com/devographicsviz">@DevographicsViz</a> on Twitter to get updates. </div>;
};

export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default MaintenancePage;
