import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOne } from '@refinedev/core';
import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { axiosInstance, API_URL } from '../dataProvider';

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'CNG', 'EV'].map((v) => ({ label: v, value: v }));

const EnquiryCard = ({ leadId, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/enquiry`).then(({ data }) => {
      if (data) form.setFieldsValue(data);
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);
    await axiosInstance.put(`${API_URL}/leads/${leadId}/enquiry`, values);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="3. Enquiry & Needs Analysis" style={{ marginBottom: 16 }}>
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
};

const TestDriveCard = ({ leadId, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/test-drive`).then(({ data }) => {
      if (data) {
        form.setFieldsValue(data);
        setExistingPhotoUrl(data.dl_photo_url);
      }
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);
    const formData = new FormData();
    formData.append('vehicle_reg_no', values.vehicle_reg_no || '');
    formData.append('scheduled_at', values.scheduled_at || '');
    formData.append('consent_given', String(!!values.consent_given));
    formData.append('completed', String(!!values.completed));
    if (existingPhotoUrl) formData.append('existing_dl_photo_url', existingPhotoUrl);
    if (file) formData.append('dl_photo', file);

    const { data } = await axiosInstance.put(`${API_URL}/leads/${leadId}/test-drive`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setExistingPhotoUrl(data.dl_photo_url);
    setFile(null);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="4. Product Demo & Test Drive" style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Vehicle Registration No." name="vehicle_reg_no">
            <Input />
          </Form.Item>
          <Form.Item label="Scheduled At" name="scheduled_at">
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item label="Consent Given" name="consent_given" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item label="Driving License Photo">
            <Upload
              beforeUpload={(f) => {
                setFile(f);
                return false;
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select DL Photo</Button>
            </Upload>
            {existingPhotoUrl ? (
              <div style={{ marginTop: 8 }}>
                <a href={`${API_URL}${existingPhotoUrl}`} target="_blank" rel="noreferrer">
                  View uploaded DL photo
                </a>
              </div>
            ) : null}
          </Form.Item>
          <Form.Item label="Test Drive Completed" name="completed" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Test Drive
          </Button>
        </Form>
      </Spin>
    </Card>
  );
};

const QuotationCard = ({ leadId, onSaved }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
};

export const LeadShow = () => {
  const { id } = useParams();
  const { result: lead, query } = useOne({ resource: 'leads', id });
  const refetch = query.refetch;

  if (query.isLoading || !lead) {
    return (
      <div style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions title={lead.customer_name} column={2}>
          <Descriptions.Item label="Phone">{lead.phone}</Descriptions.Item>
          <Descriptions.Item label="Source">{lead.source}</Descriptions.Item>
          <Descriptions.Item label="Model Interest">{lead.model_interest || '-'}</Descriptions.Item>
          <Descriptions.Item label="Stage">
            <Tag color="blue">{lead.stage}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <EnquiryCard leadId={id} onSaved={refetch} />
      <TestDriveCard leadId={id} onSaved={refetch} />
      <QuotationCard leadId={id} onSaved={refetch} />
    </div>
  );
};
