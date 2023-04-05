// TODO: uses react bootstrap a lot, need a refactor
import React from "react";
import BsDropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { FormattedMessage } from "../common/FormattedMessage";
const DropdownItem = BsDropdown.Item;
// import { LinkContainer } from "react-router-bootstrap";

/*

Note: `rest` is used to ensure auto-generated props from parent dropdown
components are properly passed down to MenuItem

*/
const Item = ({
  index,
  //to,
  labelId,
  label,
  component,
  componentProps = {},
  itemProps,
  //linkProps,
  ...rest
}: any) => {
  let menuComponent;

  if (component) {
    menuComponent = React.cloneElement(component, componentProps);
  } else if (labelId) {
    menuComponent = <FormattedMessage id={labelId} />;
  } else {
    menuComponent = <span>{label}</span>;
  }

  const item = (
    <DropdownItem eventKey={index} {...itemProps} {...rest}>
      {menuComponent}
    </DropdownItem>
  );

  /*
  @depreacted Instead wrap the item yourself with the relevant link
  return to ? (
    <LinkContainer to={to} {...linkProps}>
      {item}
    </LinkContainer>
  ) : (
    item
  );*/
  return item;
};

/*
Item.propTypes = {
  index: PropTypes.number, // index
  to: PropTypes.any, // a string or object, used to generate the router path for the menu item
  labelId: PropTypes.string, // an i18n id for the item label
  label: PropTypes.string, // item label string, used if id is not provided
  component: PropTypes.object, // a component to use as menu item
  componentProps: PropTypes.object, // props passed to the component
  itemProps: PropTypes.object, // props for the <MenuItem/> component
};
*/
/*

A node contains a menu item, and optionally a list of child items

*/
const Node = ({ childrenItems, ...rest }) => {
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
/*
Node.propTypes = {
  childrenItems: PropTypes.array, // an array of dropdown items used as children of the current item
};
*/

export const Dropdown = ({
  label,
  labelId,
  trigger,
  menuItems,
  menuContents,
  variant = "dropdown",
  buttonProps,
  ...dropdownProps
}: any) => {
  const menuBody = menuContents
    ? menuContents
    : menuItems.map((item, index) => {
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
          {...buttonProps}
          title={labelId ? <FormattedMessage id={labelId} /> : label}
          {...dropdownProps}
        >
          {menuBody}
        </DropdownButton>
      );
    }
  }
};

/*
BootstrapDropdown.propTypes = {
  labelId: PropTypes.string, // menu title/label i18n string
  label: PropTypes.string, // menu title/label
  trigger: PropTypes.object, // component used as menu trigger (the part you click to open the menu)
  menuContents: PropTypes.object, // a component specifying the menu contents
  menuItems: PropTypes.array, // an array of menu items, used if menuContents is not provided
  variant: PropTypes.string, // dropdown (default) or flat
  buttonProps: PropTypes.object, // props specific to the dropdown button
};
*/

export default Dropdown;
