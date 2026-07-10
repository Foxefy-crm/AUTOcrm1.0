"use client";

import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, Input, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstance, API_URL } from "../../lib/dataProvider";

// Same 1-to-1-nested-record pattern as EnquiryCard — see the comment there
// for why this doesn't use Refine's useForm().
export function TestDriveCard({ leadId, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  // The driving-license photo file the user just picked, held in memory
  // until "Save Test Drive" is clicked (antd's Upload doesn't upload it
  // immediately — see `beforeUpload` below).
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

    // File uploads can't be sent as JSON — multipart/form-data is required
    // so the Express side (multer) can pull the file out of the request.
    const formData = new FormData();
    formData.append("vehicle_reg_no", values.vehicle_reg_no || "");
    formData.append("scheduled_at", values.scheduled_at || "");
    formData.append("consent_given", String(!!values.consent_given));
    formData.append("completed", String(!!values.completed));
    // If the user didn't pick a NEW file this time, tell the backend to
    // keep whatever photo URL was already saved instead of wiping it.
    if (existingPhotoUrl) formData.append("existing_dl_photo_url", existingPhotoUrl);
    if (file) formData.append("dl_photo", file);

    const { data } = await axiosInstance.put(`${API_URL}/leads/${leadId}/test-drive`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
            {/* Plain HTML5 input instead of antd's DatePicker — one less
                dependency (DatePicker needs dayjs wired up) for the same
                result at this stage of the project. */}
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item label="Consent Given" name="consent_given" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item label="Driving License Photo">
            <Upload
              beforeUpload={(f) => {
                setFile(f);
                // Returning false stops antd from trying to auto-upload —
                // we send the file ourselves inside onFinish above.
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
}
