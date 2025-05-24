import { useContext } from "react";
import { SidebarContext } from "./SidebarContext";

export function useSidebarContext() {
  const value = useContext(SidebarContext);
  if (value == null) throw new Error("Cannot use outside of SidebarProvider");
  return value;
}
