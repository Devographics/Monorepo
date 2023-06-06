import React from "react";
import Nav from "./Nav";

const Header = (props) => {
  return (
    <div className="header">
      <Nav {...props} />
    </div>
  );
};

export default Header;
