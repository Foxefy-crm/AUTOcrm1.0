"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

const SOURCE_OPTIONS = [
  { label: "Walk-in", value: "walk-in" },
  { label: "Digital", value: "digital" },
  { label: "Referral", value: "referral" },
  { label: "Telecalling", value: "telecalling" },
];

export default function LeadCreatePage() {
  // useForm() (the Refine+antd version) wires an antd <Form> straight to
  // dataProvider.create("leads") — i.e. POST /leads — and handles the
  // "Save" button's loading state and the redirect back to the list on
  // success, all through `formProps`/`saveButtonProps`.
  const { formProps, saveButtonProps } = useForm({ resource: "leads" });

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
}
