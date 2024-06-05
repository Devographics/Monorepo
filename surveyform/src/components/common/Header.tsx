import React from "react";
import Nav, { tokens as tokensNav } from "./Nav";
import { EditionMetadata } from "@devographics/types";

export const tokens = [...tokensNav]

const Header = (props: { edition?: EditionMetadata }) => {
  return (
    <div className="header">
      <Nav {...props} />
    </div>
  );
};

export default Header;
