import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import MediaUpload from '../../components/upload';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function CareerCategoryForm({ form, handleSubmit, error }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  // states
  const [image, setImage] = useState(
    activeMenu.data?.image ? [activeMenu.data?.image] : []
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='basic'
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        parent_id: { title: '---', value: 0, key: 0 },
        active: true,
        ...activeMenu.data,
      }}
      form={form}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.title + index}
              label={t('name')}
              name={`title[${item.locale}]`}
              help={
                error
                  ? error[`title.${defaultLang}`]
                    ? error[`title.${defaultLang}`][0]
                    : null
                  : null
              }
              validateStatus={error ? 'error' : 'success'}
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
              <Input placeholder={t('name')} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          {languages.map((item, index) => (
            <Form.Item
              key={item.locale + index}
              label={t('description')}
              name={`description[${item.locale}]`}
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
              <TextArea maxLength={250} rows={4} />
            </Form.Item>
          ))}
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('keywords')}
            name='keywords'
            rules={[{ required: true, message: t('required') }]}
          >
            <Select mode='tags' style={{ width: '100%' }}></Select>
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                validator() {
                  if (image?.length === 0) {
                    return Promise.reject(new Error(t('required')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <MediaUpload
              type='categories'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
