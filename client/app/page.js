import { redirect } from "next/navigation";

// The bare "/" route. `redirect()` is a Next.js server-side helper — it
// sends the browser straight to /dashboard before any page HTML is even
// sent down. From there, the (protected) route group's layout takes over:
// if you're not logged in, IT will bounce you again to /login.
export default function Home() {
  redirect("/dashboard");
}
