import React, { useState } from 'react';
import { Button, Col, Form, Row, Space } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function FAQForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='faq-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={activeMenu?.data}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'question' + item.locale}
              label={t('question')}
              name={`question[${item.locale}]`}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea maxLength={250} rows={2} />
            </Form.Item>
          ))}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'answer' + item.locale}
              label={t('answer')}
              name={`answer[${item.locale}]`}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea maxLength={250} rows={6} />
            </Form.Item>
          ))}
        </Col>
      </Row>
      <Space>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Space>
    </Form>
  );
}
