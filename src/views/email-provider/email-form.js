import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Switch } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function EmailProviderForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='email-provider-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{
        smtp_debug: true,
        smtp_auth: true,
        active: true,
        ...activeMenu.data,
      }}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            rules={[
              {
                required: true,
                message: t('required'),
              },
              {
                type: 'email',
                message: t('invalid.email'),
              },
            ]}
            label={t('email')}
            name='from_to'
          >
            <Input placeholder='Email' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            rules={[
              {
                required: true,
                message: t('required'),
              },
              {
                type: 'string',
                min: 6,
                message: t('min.6.letters'),
              },
            ]}
            label={t('password')}
            name='password'
            normalize={(value) =>
              value?.trim() === '' ? value?.trim() : value
            }
          >
            <Input.Password />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error(t('required')));
                  } else if (value && value?.trim() === '') {
                    return Promise.reject(new Error(t('no.empty.space')));
                  } else if (value && value?.trim().length < 2) {
                    return Promise.reject(new Error(t('must.be.at.least.2')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            label={t('host')}
            name='host'
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
            label={t('port')}
            name='port'
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            valuePropName='checked'
            label={t('smtp_debug')}
            name='smtp_debug'
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            valuePropName='checked'
            label={t('smtp_auth')}
            name='smtp_auth'
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('submit')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
