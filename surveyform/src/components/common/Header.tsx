import React from "react";
import Nav from "./Nav";
import { EditionMetadata } from "@devographics/types";

const Header = (props: { edition?: EditionMetadata }) => {
  return (
    <div className="header">
      <Nav {...props} />
    </div>
  );
};

export default Header;
