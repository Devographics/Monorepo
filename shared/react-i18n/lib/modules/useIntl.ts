// TODO: not used?
import { useContext } from "react";
import IntlContext from "./context";

export default function useIntl() {
  const intl = useContext(IntlContext);
  return intl;
}
