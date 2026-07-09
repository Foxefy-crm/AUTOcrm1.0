"use client";

// Everything in this file needs the browser (React context, hooks,
// localStorage via authProvider/dataProvider) — hence "use client" above.
// It's imported once, by the root layout, and wraps the ENTIRE app.

import { Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd";
// The Next.js App Router build of Refine's router bindings. This is what
// translates Refine's internal "go to the list page of resource X" calls
// into real Next.js navigation (next/navigation's useRouter/usePathname
// under the hood — see node_modules/@refinedev/nextjs-router if curious).
import routerProvider from "@refinedev/nextjs-router/app";
import { App as AntdApp, ConfigProvider } from "antd";

// Ant Design v5's CSS + a compatibility patch for React 19 (antd was built
// before React 19 existed; this patch silences a console warning and
// keeps its styling engine working correctly).
import "@refinedev/antd/dist/reset.css";
import "@ant-design/v5-patch-for-react-19";

import { authProvider } from "../lib/authProvider";
import { dataProvider } from "../lib/dataProvider";

export function Providers({ children }) {
  return (
    // ConfigProvider + AntdApp are Ant Design's own top-level wrappers —
    // AntdApp specifically is required for antd's `message`/`notification`
    // popups (used e.g. after saving a lead) to work correctly.
    <ConfigProvider>
      <AntdApp>
        <Refine
          routerProvider={routerProvider}
          authProvider={authProvider}
          dataProvider={dataProvider}
          notificationProvider={useNotificationProvider}
          // `resources` tells Refine which URL corresponds to which
          // action, for a given named "resource" (roughly: a database
          // table/API collection). This is what lets hooks like useTable()
          // or components like <List> figure out "where is the create
          // page for leads?" without you repeating the URL everywhere.
          //
          // "dashboard" isn't a real CRUD resource — it's registered here
          // purely so it shows up as a sidebar link (see ThemedLayout in
          // app/(protected)/layout.js).
          resources={[
            { name: "dashboard", list: "/dashboard", meta: { label: "Dashboard" } },
            {
              name: "leads",
              list: "/leads",
              create: "/leads/create",
              show: "/leads/:id",
              meta: { label: "Leads" },
            },
          ]}
          options={{ disableTelemetry: true }}
        >
          {children}
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
