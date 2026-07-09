"use client";

// Another route group (see the (auth) layout for what that means). This
// one wraps every page a logged-in user actually works in: the dashboard
// and the leads pages.
import { Authenticated } from "@refinedev/core";
import { ThemedLayout } from "@refinedev/antd";
import { RedirectTo } from "../../components/RedirectTo";

export default function ProtectedLayout({ children }) {
  return (
    <Authenticated
      key="protected"
      // Not logged in -> send them to /login instead of rendering
      // whatever page they tried to reach.
      fallback={<RedirectTo to="/login" />}
    >
      {/* Logged in -> render the page, wrapped in Refine's ready-made
          "admin panel" shell: a sidebar (built from the `resources` list
          in providers.js) plus a header showing the current user and a
          logout link. */}
      <ThemedLayout>{children}</ThemedLayout>
    </Authenticated>
  );
}
