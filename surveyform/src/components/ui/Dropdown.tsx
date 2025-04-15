// TODO: uses react bootstrap a lot, need a refactor
import React from "react";
import BsDropdown, { DropdownProps } from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
const DropdownItem = BsDropdown.Item;
// import { LinkContainer } from "react-router-bootstrap";

/*

Note: `rest` is used to ensure auto-generated props from parent dropdown
components are properly passed down to MenuItem

*/
const Item = ({
  index,
  //to,
  label,
  component,
  componentProps = {},
  itemProps,
  //linkProps,
  ...rest
}: {
  index: number;
  label?: string | React.ReactNode;
  component?: any;
  componentProps?: any;
  itemProps?: any;
}) => {
  let menuComponent;

  if (component) {
    menuComponent = React.cloneElement(component, componentProps);
  } else if (typeof label === "string") {
    menuComponent = <span>{label}</span>;
  } else {
    menuComponent = label;
  }

  const item = (
    <DropdownItem eventKey={index} {...itemProps} {...rest}>
      {menuComponent}
    </DropdownItem>
  );
  return item;
};

/**
A node contains a menu item, and optionally a list of child items

*/
const Node = ({ childrenItems, ...rest }: any) => {
  return (
    <>
      <Item {...rest} />
      {childrenItems && !!childrenItems.length && (
        <div className="menu-node-children">
          {childrenItems.map((item, index) => (
            <Item key={index} {...item} />
          ))}
        </div>
      )}
    </>
  );
};

type MenuItem = { label?: string | React.ReactNode } | "divider";

export const Dropdown = ({
  label,
  trigger,
  menuItems,
  menuContents,
  variant = "dropdown",
  buttonProps,
  ...dropdownProps
}: {
  label: string | React.ReactNode;
  trigger: any;
  menuContents?: React.ReactNode;
  menuItems?: Array<MenuItem>;
  variant?: "dropdown" | "flat";
  buttonProps?: any;
  // dropdown props
} & DropdownProps) => {
  const menuBody = menuContents
    ? menuContents
    : (menuItems || []).map((item, index) => {
        if (item === "divider") {
          return <BsDropdown.Divider key={index} />;
        } else {
          return <Node {...item} key={index} index={index} />;
        }
      });

  if (variant === "flat") {
    return menuBody;
  } else {
    if (trigger) {
      // if a trigger component has been provided, use it
      return (
        <BsDropdown {...dropdownProps}>
          <BsDropdown.Toggle>{trigger}</BsDropdown.Toggle>
          <BsDropdown.Menu>{menuBody}</BsDropdown.Menu>
        </BsDropdown>
      );
    } else {
      // else default to DropdownButton
      return (
        <DropdownButton
          menuVariant="dark"
          {...buttonProps}
          title={label}
          {...dropdownProps}
        >
          {menuBody}
        </DropdownButton>
      );
    }
  }
};

export default Dropdown;
