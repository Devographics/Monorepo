import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
// @see https://github.com/react-bootstrap/react-router-bootstrap
// import { IndexLinkContainer } from "react-router-bootstrap";
import LocaleSwitcher from "./LocaleSwitcher";
import { isAdmin } from "@vulcanjs/permissions";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import Link from "next/link";
import { routes } from "~/lib/routes";
import { useUser } from "~/account/user/hooks";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

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

const adminNavContents: Array<NavItemDef> = [
  {
    label: "Stats",
    to: "/admin/stats",
  },
  // {
  //   label: 'Surveys',
  //   to: '/admin/surveys',
  // },
  {
    label: "Users",
    to: "/admin/users",
  },
  {
    label: "Responses",
    to: "/admin/responses",
  },
  {
    label: "Normalization",
    to: "/admin/normalization",
  },
  {
    label: "Projects",
    to: "/admin/projects",
  },
  {
    label: "Export",
    to: routes.admin.export.href,
  },
  // {
  //   label: 'Normalized Responses',
  //   to: '/admin/normalized-responses',
  // },
];

const Navigation = () => {
  const Components = useVulcanComponents();
  const { user } = useUser();
  let navItems = navContents;
  if (user) {
    navItems = [...navItems, ...loggedInNavContents];
    if (isAdmin(user)) {
      navItems = [...navItems, ...adminNavContents];
    }
  }
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
  const Components = useVulcanComponents();
  return (
    <Nav.Item>
      {/*<IndexLinkContainer to={to}>*/}
      <Link href={to} passHref>
        <Nav.Link>{label ? label : <FormattedMessage id={id} />}</Nav.Link>
      </Link>
      {/*</IndexLinkContainer>*/}
    </Nav.Item>
  );
};

export default Navigation;
