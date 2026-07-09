"use client";

import { useLogin } from "@refinedev/core";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import Link from "next/link";

export default function LoginPage() {
  // useLogin() gives us a `mutate` function (renamed to `login` here) that
  // calls authProvider.login() under the hood and follows its
  // `redirectTo` on success automatically — we never call the router
  // ourselves in this component.
  const { mutate: login, isLoading, error } = useLogin();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Log in
        </Typography.Title>
        <Form layout="vertical" onFinish={(values) => login(values)}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email is required" }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          {error ? <Alert type="error" message={error.message} style={{ marginBottom: 16 }} /> : null}
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Log in
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
          No account? <Link href="/register">Sign up</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
