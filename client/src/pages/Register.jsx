import { useRegister } from '@refinedev/core';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { Link } from 'react-router-dom';

export const Register = () => {
  const { mutate: register, isLoading, error } = useRegister();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>Create account</Typography.Title>
        <Form layout="vertical" onFinish={(values) => register(values)}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          {error ? <Alert type="error" message={error.message} style={{ marginBottom: 16 }} /> : null}
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Sign up
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};
