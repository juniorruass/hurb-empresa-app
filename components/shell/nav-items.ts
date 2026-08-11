import type { ReactNode } from "react";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
};
