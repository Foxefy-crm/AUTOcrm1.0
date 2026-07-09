"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// A tiny helper used as the "redirect somewhere else" branch of Refine's
// <Authenticated> guard (see app/(auth)/layout.js and
// app/(protected)/layout.js). It renders nothing — its only job is to
// trigger a client-side navigation as soon as it mounts.
//
// Why a component instead of just calling router.replace() directly in the
// layout? Because <Authenticated fallback={...}> expects a *React element*
// for its fallback, not a function to call — so the redirect has to happen
// inside a component's effect, not during render.
export function RedirectTo({ to }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
}
