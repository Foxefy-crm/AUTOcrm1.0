"use client";

import { useGetIdentity, useLogout } from "@refinedev/core";
import { Button, Spin, Typography } from "antd";

export default function DashboardPage() {
  // useGetIdentity() calls authProvider.getIdentity() (which itself hits
  // GET /auth/me) and gives us the logged-in user's record.
  const { data: user, isLoading } = useGetIdentity();
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Welcome, {user?.name}</Typography.Title>
      <Typography.Paragraph>This is your blank dashboard.</Typography.Paragraph>
      <Button onClick={() => logout()}>Log out</Button>
    </div>
  );
}
