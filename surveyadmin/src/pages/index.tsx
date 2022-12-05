import Link from "next/link";
import { useUser } from "~/account/user/hooks";
import { getLocaleStaticProps } from "~/i18n/server/ssr";
import { routes } from "~/lib/routes";
export const IndexPage = () => {
  const { user } = useUser({
    redirectIfFound: false,
    redirectIfNotAdmin: false,
  });
  return (
    <div>
      {!user?.isAdmin ? (
        <Link href={routes.admin.login.href}>Go to login page</Link>
      ) : (
        <Link href={routes.admin.home.href}>Go to admin area</Link>
      )}
    </div>
  );
};

export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default IndexPage;
