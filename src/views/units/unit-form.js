import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Switch } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function UnitForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
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
      name='unit-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item, idx) => (
            <Form.Item
              key={'title' + idx}
              label={t('title')}
              name={`title[${item.locale}]`}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12}>
          <div className='col-md-12 col-sm-6'>
            <Form.Item
              label={t('position')}
              name='position'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select>
                <Select.Option value='after'>{t('after')}</Select.Option>
                <Select.Option value='before'>{t('before')}</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Col>

        <Col span={6}>
          <div className='col-md-12 col-sm-6'>
            <Form.Item
              label={t('active')}
              name='active'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </div>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
