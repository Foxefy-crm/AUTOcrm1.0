import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

const SOURCE_OPTIONS = [
  { label: 'Walk-in', value: 'walk-in' },
  { label: 'Digital', value: 'digital' },
  { label: 'Referral', value: 'referral' },
  { label: 'Telecalling', value: 'telecalling' },
];

export const LeadCreate = () => {
  const { formProps, saveButtonProps } = useForm({ resource: 'leads' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Customer Name" name="customer_name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Source" name="source" rules={[{ required: true }]}>
          <Select options={SOURCE_OPTIONS} />
        </Form.Item>
        <Form.Item label="Model Interest" name="model_interest">
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
