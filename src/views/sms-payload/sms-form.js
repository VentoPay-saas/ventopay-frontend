import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Space, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const options = [
  { title: 'firebase', value: 'firebase' },
  { title: 'twilio', value: 'twilio' },
];

export default function SmsPayloadForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { smsGatewaysList } = useSelector((state) => state.sms, shallowEqual);
  const params = useParams();

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [type, setType] = useState(params?.type);

  //helper function
  const handleChange = (value) => setType(value);

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);

    const data = {
      customType: type,
      ...values,
    };
    handleSubmit(data).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name={'sms-payload-form'}
      form={form}
      layout='vertical'
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('select.type')}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              className='w-100'
              onChange={handleChange}
              options={options.filter(
                (i) => !smsGatewaysList.some((e) => e.type === i.value),
              )}
              disabled={!!params?.type}
            />
          </Form.Item>
        </Col>

        {type === 'firebase' && (
          <>
            <Col span={12}>
              <Form.Item
                label={t('android_api_key')}
                name='android_api_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('api_key')}
                name='api_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('app_id')}
                name='app_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('auth_domain')}
                name='auth_domain'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('ios_api_key')}
                name='ios_api_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('measurement_id')}
                name='measurement_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('message_sender_id')}
                name='message_sender_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('project_id')}
                name='project_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('server_key')}
                name='server_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('storage_bucket')}
                name='storage_bucket'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('vapid_key')}
                name='vapid_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('default')}
                name='default'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
          </>
        )}

        {type === 'twilio' && (
          <>
            <Col span={12}>
              <Form.Item
                label={t('twilio_auth_token')}
                name='twilio_auth_token'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input min={0} className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('twilio_account_id')}
                name='twilio_account_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('twilio_number')}
                name='twilio_number'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('default')}
                name='default'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <Space>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Space>
    </Form>
  );
}
