import { createContext } from "react";

export type SidebarContextType = {
  isLargeOpen: boolean;
  isSmallOpen: boolean;
  toggle: () => void;
  close: () => void;
};

export const SidebarContext = createContext<SidebarContextType | null>(null);
