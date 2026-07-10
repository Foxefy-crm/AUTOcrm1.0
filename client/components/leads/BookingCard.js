"use client";

import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, InputNumber, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstance, API_URL } from "../../lib/dataProvider";

// Same file-upload pattern as TestDriveCard's DL photo — see that file's
// comments for why the upload is deferred to the "Save" click instead of
// uploading the instant a file is picked.
export function BookingCard({ leadId, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingKycUrl, setExistingKycUrl] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    axiosInstance.get(`${API_URL}/leads/${leadId}/booking`).then(({ data }) => {
      if (data) {
        form.setFieldsValue(data);
        setExistingKycUrl(data.kyc_doc_url);
      }
      setLoading(false);
    });
  }, [leadId]);

  const onFinish = async (values) => {
    setSaving(true);

    const formData = new FormData();
    formData.append("token_amount", values.token_amount || "");
    formData.append("aadhaar_verified", String(!!values.aadhaar_verified));
    if (existingKycUrl) formData.append("existing_kyc_doc_url", existingKycUrl);
    if (file) formData.append("kyc_doc", file);

    const { data } = await axiosInstance.put(`${API_URL}/leads/${leadId}/booking`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setExistingKycUrl(data.kyc_doc_url);
    setFile(null);
    setSaving(false);
    onSaved?.();
  };

  return (
    <Card title="7. Booking & Documentation" style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Token Amount" name="token_amount">
            <InputNumber style={{ width: 200 }} min={0} />
          </Form.Item>
          <Form.Item label="KYC Document">
            <Upload
              beforeUpload={(f) => {
                setFile(f);
                return false;
              }}
              maxCount={1}
              accept="image/*,.pdf"
            >
              <Button icon={<UploadOutlined />}>Select KYC Document</Button>
            </Upload>
            {existingKycUrl ? (
              <div style={{ marginTop: 8 }}>
                <a href={`${API_URL}${existingKycUrl}`} target="_blank" rel="noreferrer">
                  View uploaded KYC document
                </a>
              </div>
            ) : null}
          </Form.Item>
          <Form.Item label="Aadhaar Verified" name="aadhaar_verified" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Booking
          </Button>
        </Form>
      </Spin>
    </Card>
  );
}
