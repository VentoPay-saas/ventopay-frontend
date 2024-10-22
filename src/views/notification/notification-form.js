import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import CkeEditor from 'components/ckeEditor';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

export default function NotificationForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='notification-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{
        active: true,
        ...activeMenu.data,
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'title' + item.locale}
              label={t('title')}
              name={`title[${item.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
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
              hidden={item.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          {languages.map((item) => (
            <Form.Item
              key={'short_desc' + item.locale}
              label={t('short.description')}
              name={`short_desc[${item.locale}]`}
              rules={[
                {
                  validator(_, value) {
                    if (!value && item?.locale === defaultLang) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 5) {
                      return Promise.reject(new Error(t('must.be.at.least.5')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          <CkeEditor form={form} languages={languages} lang={defaultLang} />
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
