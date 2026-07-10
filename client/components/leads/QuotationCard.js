"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, InputNumber, Space, Spin, Typography } from "antd";
import { axiosInstance, API_URL } from "../../lib/dataProvider";

export function QuotationCard({ leadId, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // on_road_price is calculated server-side (see server/routes/leads.js) —
  // we just display whatever it sends back, we don't compute it here.
  const [onRoadPrice, setOnRoadPrice] = useState(null);

  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/quotation`).then(({ data }) => {
      if (data) {
        form.setFieldsValue(data);
        setOnRoadPrice(data.on_road_price);
      }
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);
    const { data } = await axiosInstance.put(`${API_URL}/leads/${leadId}/quotation`, values);
    setOnRoadPrice(data.on_road_price);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="5. Quotation & Negotiation" style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space size="large" wrap>
            <Form.Item label="Ex-Showroom Price" name="ex_showroom_price">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
            <Form.Item label="Road Tax" name="road_tax">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
            <Form.Item label="Insurance" name="insurance">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
            <Form.Item label="RTO Charges" name="rto_charges">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
            <Form.Item label="Accessories" name="accessories">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
            <Form.Item label="Exchange Bonus" name="exchange_bonus">
              <InputNumber style={{ width: 180 }} min={0} />
            </Form.Item>
          </Space>
          {onRoadPrice != null ? (
            <Typography.Title level={4}>On-Road Price: {onRoadPrice}</Typography.Title>
          ) : null}
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Quotation
          </Button>
        </Form>
      </Spin>
    </Card>
  );
}
