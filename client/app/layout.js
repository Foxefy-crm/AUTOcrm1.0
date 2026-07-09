import "./globals.css";
import { Providers } from "./providers";

// Metadata here becomes the <title>/<meta description> tags in the <head>.
// This is a Next.js App Router convention — any file can export `metadata`
// and Next.js merges it up the layout tree automatically.
export const metadata = {
  title: "AutoCRM",
  description: "Automotive dealership CRM",
};

// This file is a Server Component (no "use client" at the top). Next.js
// requires the ROOT layout specifically to render <html> and <body> — every
// other layout in the app just returns whatever markup it needs.
//
// Everything that actually needs the browser (Refine, Ant Design, hooks,
// localStorage, etc.) lives inside <Providers>, which is a separate file
// marked "use client". We keep that boundary here at the very top of the
// tree so the split is obvious: this file is "the shell", providers.js is
// "everything interactive".
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
