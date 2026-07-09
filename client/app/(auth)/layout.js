"use client";

// A "route group" — the parentheses in the folder name "(auth)" mean it
// does NOT become part of the URL (login is at /login, not /auth/login).
// It exists purely so /login and /register can share this one layout.
//
// This layout's job: if you're ALREADY logged in and you somehow land on
// /login or /register, bounce you to the dashboard instead of showing the
// form again.
import { Authenticated } from "@refinedev/core";
import { RedirectTo } from "../../components/RedirectTo";

export default function AuthLayout({ children }) {
  return (
    <Authenticated
      key="auth-pages"
      // If the authProvider.check() call says "not authenticated", render
      // the fallback — which here is just the page itself (login/register).
      fallback={children}
    >
      {/* If it says "authenticated", we end up here instead — send them
          away from the login/register form since they don't need it. */}
      <RedirectTo to="/dashboard" />
    </Authenticated>
  );
}
