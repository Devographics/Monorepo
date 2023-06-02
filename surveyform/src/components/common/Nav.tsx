"use client";
import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
// @see https://github.com/react-bootstrap/react-router-bootstrap
// import { IndexLinkContainer } from "react-router-bootstrap";
import LocaleSwitcher from "./LocaleSwitcher";
import Link from "next/link";
import { routes } from "~/lib/routes";
import { useCurrentUser } from "~/lib/users/hooks";
import { FormattedMessage } from "~/components/common/FormattedMessage";

interface NavItemDef {
  id?: string;
  label?: string;
  to: string;
}
const navContents: Array<NavItemDef> = [
  {
    id: "nav.surveys",
    to: routes.home.href,
  },
];

const loggedInNavContents: Array<NavItemDef> = [
  {
    id: "nav.account",
    to: routes.account.profile.href,
  },
];

const Navigation = () => {
  const { currentUser } = useCurrentUser();
  let navItems = navContents;
  return (
    <div className="nav-wrapper">
      <Navbar
        collapseOnSelect
        expand="lg"
        variant="dark"
        aria-labelledby="global-nav"
      >
        <p className="hidden" id="global-nav">
          <FormattedMessage id={"general.global_nav"} />
        </p>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav /*expand="lg"*/>
            {navItems.map((item, i) => (
              // @ts-ignore
              <NavItem {...item} key={i} />
            ))}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="nav-item-locale">
        <LocaleSwitcher />
      </div>
    </div>
  );
};

const NavItem = ({ to, label, id }) => {
  return (
    <Nav.Item>
      {/*<IndexLinkContainer to={to}>*/}
      <Link href={to} passHref legacyBehavior>
        <Nav.Link>{label ? label : <FormattedMessage id={id} />}</Nav.Link>
      </Link>
      {/*</IndexLinkContainer>*/}
    </Nav.Item>
  );
};

export default Navigation;
