"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Select, Space, Spin, Switch } from "antd";
import { axiosInstance, API_URL } from "../../lib/dataProvider";

const FUEL_OPTIONS = ["Petrol", "Diesel", "CNG", "EV"].map((v) => ({ label: v, value: v }));

// This card (and TestDriveCard/QuotationCard next to it) is NOT built on
// Refine's useForm() like the leads Create/List pages are. That's on
// purpose: an enquiry/test-drive/quotation is a 1-to-1 side record of a
// single lead (see server/db/init.sql — each has a UNIQUE lead_id), not an
// independent list of records you'd browse on its own. Refine's resource
// hooks are built around "collections you list/create/edit", which doesn't
// quite fit here, so this just talks to the nested Express endpoints
// directly with the same authenticated axios instance the dataProvider
// uses (see lib/dataProvider.js).
//
// `onSaved` is a callback the parent (the lead detail page) passes in, so
// it knows to re-fetch the lead's `stage` after we advance it server-side.
export function EnquiryCard({ leadId, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // On mount: fetch any enquiry already saved for this lead, and pre-fill
  // the form with it (GET /leads/:id/enquiry returns null if none yet).
  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/enquiry`).then(({ data }) => {
      if (data) form.setFieldsValue(data);
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);
    // PUT here is an upsert on the backend: insert if this lead has no
    // enquiry yet, otherwise update the existing one. It also advances
    // leads.stage to 'enquiry_done' as a side effect.
    await axiosInstance.put(`${API_URL}/leads/${leadId}/enquiry`, values);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="3. Enquiry & Needs Analysis" style={{ marginBottom: 16 }}>
      {/* Spin wraps (rather than replaces) the form so the Form instance
          stays mounted the whole time — swapping it out during loading
          causes an antd warning about a "disconnected" form instance. */}
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Variant" name="variant">
            <Input placeholder="e.g. Top trim" />
          </Form.Item>
          <Form.Item label="Fuel Type" name="fuel_type">
            <Select options={FUEL_OPTIONS} allowClear />
          </Form.Item>
          <Space size="large">
            <Form.Item label="Budget Min" name="budget_min">
              <InputNumber style={{ width: 160 }} min={0} />
            </Form.Item>
            <Form.Item label="Budget Max" name="budget_max">
              <InputNumber style={{ width: 160 }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item label="Has Exchange Vehicle" name="has_exchange" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Enquiry
          </Button>
        </Form>
      </Spin>
    </Card>
  );
}
