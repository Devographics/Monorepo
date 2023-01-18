import { useContext } from "react";
import { VulcanCurrentUserContext } from "./Context";

export const VulcanCurrentUserConsumer = VulcanCurrentUserContext.Consumer;

export const useVulcanCurrentUser = () => useContext(VulcanCurrentUserContext);
