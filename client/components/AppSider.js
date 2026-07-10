"use client";

import { useMenu, useLogout } from "@refinedev/core";
import { Layout, Menu } from "antd";
import { LogoutOutlined, UnorderedListOutlined } from "@ant-design/icons";
import Link from "next/link";

// A hand-written replacement for @refinedev/antd's default sidebar
// (ThemedSider). Why we need our own at all: ThemedSider always builds its
// menu as `<Menu>{...items}</Menu>` (the old, deprecated antd API), and
// there's no prop that avoids that — even its own `render` customization
// hook still gets wrapped the same way internally. That triggers a
// "[antd: Menu] children is deprecated" warning on every page, which in
// Next.js 16's dev mode shows up as a blocking "1 Issue" overlay with no
// way to configure it away (confirmed: `devIndicators: false` only hides
// the small route-info badge, not this). The only real fix is to not call
// their Menu-with-children code path at all — so this component builds the
// menu with antd's current `items` prop instead.
//
// `useMenu()` is the same Refine hook ThemedSider uses internally — it
// turns the `resources` array from app/providers.js into a ready-to-render
// list, keyed by whichever route matches the current URL.
export function AppSider() {
  const { menuItems, selectedKey } = useMenu();
  const { mutate: logout } = useLogout();

  const items = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon ?? <UnorderedListOutlined />,
    label: <Link href={item.route ?? "/"}>{item.label ?? item.name}</Link>,
  }));

  items.push({
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Logout",
  });

  return (
    <Layout.Sider style={{ backgroundColor: "#fff", borderRight: "1px solid #f0f0f0" }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", paddingLeft: 24, fontWeight: 600 }}>
        AutoCRM
      </div>
      <Menu
        mode="inline"
        items={items}
        selectedKeys={selectedKey ? [selectedKey] : []}
        style={{ borderInlineEnd: "none" }}
        onClick={({ key }) => {
          if (key === "logout") logout();
        }}
      />
    </Layout.Sider>
  );
}
