import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}
