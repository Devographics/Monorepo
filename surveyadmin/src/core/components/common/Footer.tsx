import React from "react";
import Link from "next/link";
import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";

export const Footer = () => {
  const { user } = useUser();

  return (
    <footer className="footer">
      <div className="footer-top">
        &copy; 2023 <a href="https://devographics.com/">Devographics</a> |{" "}
        {!user && (
          <>
            <Link href={routes.admin.login.href}>Login</Link>
          </>
        )}
        {user && (
          <>
            <LogoutButton component={"a" as const} /> |{" "}
          </>
        )}{" "}
        |{" "}
        <>
          <Link href={routes.admin.home.href}>Admin area</Link>
        </>
      </div>
    </footer>
  );
};

export default Footer;
