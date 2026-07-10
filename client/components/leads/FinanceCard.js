"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Select, Spin } from "antd";
import { axiosInstance, API_URL } from "../../lib/dataProvider";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// Same nested 1-to-1-record pattern as the Phase 2 cards (Enquiry/Test
// Drive/Quotation) — see EnquiryCard.js for the full explanation of why
// this doesn't use Refine's useForm().
export function FinanceCard({ leadId, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/finance`).then(({ data }) => {
      if (data) form.setFieldsValue(data);
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);
    await axiosInstance.put(`${API_URL}/leads/${leadId}/finance`, values);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="6. Finance & Insurance" style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "pending" }}>
          <Form.Item label="Lender Name" name="lender_name">
            <Input placeholder="e.g. HDFC, Bajaj Finserv" />
          </Form.Item>
          <Form.Item label="Loan Amount" name="loan_amount">
            <InputNumber style={{ width: 200 }} min={0} />
          </Form.Item>
          {/*
            The lead only advances to the "financed" stage once this is
            set to "approved" — see server/routes/leads.js's PUT
            /leads/:id/finance. Leaving it "pending" or "rejected" just
            saves the application without moving the pipeline forward.
          */}
          <Form.Item label="Loan Status" name="status">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item label="Insurer Name" name="insurer_name">
            <Input placeholder="e.g. Bajaj Allianz, HDFC ERGO" />
          </Form.Item>
          <Form.Item label="Policy Number" name="policy_number">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Finance Details
          </Button>
        </Form>
      </Spin>
    </Card>
  );
}
