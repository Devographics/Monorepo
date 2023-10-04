import Form from "react-bootstrap/Form";

export const FormElement = ({ children }) => {
  return <Form noValidate>{children}</Form>;
};

export default FormElement;
