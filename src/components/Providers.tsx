"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppProgressBar
        height="3px"
        color="#facc15"
        options={{ showSpinner: false, minimum: 0.15 }}
        shallowRouting
      />
    </>
  );
}
