"use client";

// This app's authentication is deliberately simple: the Express backend
// hands out a JWT on login/signup, we store it in the browser's
// localStorage, and attach it as `Authorization: Bearer <token>` on every
// request that needs to know who's asking. There is no server-side
// session/cookie involved — Next.js is only used here to render pages and
// route between them, it never itself decides who's logged in.
//
// `authProvider` is a Refine convention: an object with a fixed set of
// methods that Refine's hooks (useLogin, useLogout, useGetIdentity, the
// <Authenticated> guard component, ...) call behind the scenes. As long as
// this object implements the methods below, Refine doesn't care that the
// backend is a hand-rolled Express API instead of one of its official
// integrations.

const API_URL = "http://localhost:8001";
const TOKEN_KEY = "token";

export const authProvider = {
  // Called by Refine's `useLogin()` hook when the login form submits.
  login: async ({ email, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      // Returning { success: false } (instead of throwing) is how Refine
      // expects failures to be reported — it surfaces `error.message` as a
      // notification automatically.
      return {
        success: false,
        error: { name: "LoginError", message: data.error || "Login failed" },
      };
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    // `redirectTo` tells Refine where to send the user next; it calls the
    // router provider's navigation for us, no manual redirect needed here.
    return { success: true, redirectTo: "/dashboard" };
  },

  // Called by Refine's `useRegister()` hook (the "Sign up" form).
  register: async ({ name, email, password }) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: { name: "RegisterError", message: data.error || "Signup failed" },
      };
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    return { success: true, redirectTo: "/dashboard" };
  },

  // Called by Refine's `useLogout()` hook (the "Log out" button/menu item).
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return { success: true, redirectTo: "/login" };
  },

  // Called by the <Authenticated> guard component to decide whether to
  // render its `children` (logged in) or its `fallback` (not logged in).
  // We do a real round-trip to /auth/me rather than just checking "is
  // there a token" so an expired/invalid token still gets treated as
  // logged-out instead of showing a broken page.
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, redirectTo: "/login" };
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      return { authenticated: false, redirectTo: "/login" };
    }

    return { authenticated: true };
  },

  // Called whenever any Refine data hook gets an error back. If the API
  // ever responds 401 (e.g. token expired mid-session), returning
  // `{ logout: true }` tells Refine to log the user out and send them to
  // /login instead of leaving them stuck on a broken screen.
  onError: async (error) => {
    if (error?.statusCode === 401 || error?.status === 401) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },

  // Called by `useGetIdentity()` — this is what powers "Welcome, {name}"
  // on the dashboard and the user's name in the top-right of the layout.
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  },
};
