import { createContext } from "react";
import type { VulcanUser } from "@vulcanjs/permissions";

export type VulcanCurrentUserContextType =
  | { currentUser: VulcanUser | null; loading: false }
  | { loading: true; currentUser: any };
// We need this to shut TypeScript up
// You should use the Provider to get the right default values
export const VulcanCurrentUserContext =
  createContext<VulcanCurrentUserContextType>({
    currentUser: null,
    loading: false,
  });
