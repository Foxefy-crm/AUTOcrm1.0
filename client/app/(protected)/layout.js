"use client";

// Another route group (see the (auth) layout for what that means). This
// one wraps every page a logged-in user actually works in: the dashboard
// and the leads pages.
import { Authenticated } from "@refinedev/core";
import { ThemedLayout } from "@refinedev/antd";
import { RedirectTo } from "../../components/RedirectTo";
import { AppSider } from "../../components/AppSider";

export default function ProtectedLayout({ children }) {
  return (
    <Authenticated
      key="protected"
      // Not logged in -> send them to /login instead of rendering
      // whatever page they tried to reach.
      fallback={<RedirectTo to="/login" />}
    >
      {/* Logged in -> render the page, wrapped in Refine's "admin panel"
          shell (header showing the current user, content area), but with
          our own AppSider instead of ThemedLayout's default sidebar — see
          AppSider.js for why. */}
      <ThemedLayout Sider={AppSider}>{children}</ThemedLayout>
    </Authenticated>
  );
}
