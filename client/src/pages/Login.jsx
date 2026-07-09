import { useLogin } from '@refinedev/core';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { Link } from 'react-router-dom';

export const Login = () => {
  const { mutate: login, isLoading, error } = useLogin();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>Log in</Typography.Title>
        <Form layout="vertical" onFinish={(values) => login(values)}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          {error ? <Alert type="error" message={error.message} style={{ marginBottom: 16 }} /> : null}
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Log in
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
          No account? <Link to="/register">Sign up</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};
