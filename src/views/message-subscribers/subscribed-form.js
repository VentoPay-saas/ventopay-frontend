import React, { useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { DebounceSelect } from '../../components/search';
import TextEditor from './textEditor';
import moment from 'moment/moment';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import emailService from '../../services/emailSettings';

const options = [
  { title: 'order', value: 'order' },
  { title: 'subscribe', value: 'subscribe' },
  { title: 'verify', value: 'verify' },
];

export default function SubscribedForm({ type = 'add', form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { subscribers } = useSelector(
    (state) => state.messageSubscriber,
    shallowEqual,
  );

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);

  // helper functions
  const getInitialValues = () => {
    const data = activeMenu.data;
    if (!data?.send_to) {
      return data;
    }
    const start = data.send_to;
    return {
      ...data,
      send_to: moment(start, 'YYYY-MM-DD'),
    };
  };

  // fetch functions
  const fetchEmailProvider = () => {
    return emailService.get().then(({ data }) =>
      data.map((item) => ({
        label: item?.host,
        value: item?.id,
      })),
    );
  };

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='subscriber-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{
        ...activeMenu.data,
        ...getInitialValues(),
      }}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('subject')}
            name='subject'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('type')}
            name='type'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              disabled={type === 'edit'}
              options={options.filter(
                (i) => !subscribers.some((e) => e.type === i.value),
              )}
              className='w-100'
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('email.setting.id')}
            name='email_setting_id'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect
              fetchOptions={fetchEmailProvider}
              className='w-100'
              placeholder={t('email.setting.id')}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <TextEditor languages={languages} form={form} lang={defaultLang} />
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('alt.body')}
            name='alt_body'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('send.to')}
            name='send_to'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DatePicker
              showTime
              className='w-100'
              disabledDate={(current) => moment().add(-1, 'days') >= current}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('send')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
