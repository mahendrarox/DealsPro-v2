import type { ReactNode } from "react";

export const metadata = {
  title: "DealsPro",
  description: "DealsPro Studio V2",
};

/** Mobile-first by default: the viewport meta is the one non-negotiable. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
