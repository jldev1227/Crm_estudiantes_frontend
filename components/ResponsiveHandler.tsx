"use client";

import { useMediaQuery } from "react-responsive";

export default function ResponsiveHandler({ children }: { children: (isDesktopOrLaptop: boolean) => React.ReactNode }) {
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 992 });

  return isDesktopOrLaptop && children;
}