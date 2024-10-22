import React, { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Button, Col, Form, Input, Row, Space, Switch } from 'antd';
import MediaUpload from '../../components/upload';
import CkeEditor from '../../components/ckeEditor';
import { useTranslation } from 'react-i18next';

export default function BlogForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  // states
  const [image, setImage] = useState(
    activeMenu?.data?.image ? activeMenu?.data?.image : [],
  );

  const [loadingBtn, setLoadingBtn] = useState(false);

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='blog-form'
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
        <Col>
          <Form.Item
            label={t('image')}
            rules={[
              {
                required: !image.length,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='blogs'
              imageList={image}
              setImageList={setImage}
              form={form}
              length='1'
              multiple={false}
            />
          </Form.Item>
        </Col>
        <Col>
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
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'short_desc' + item.locale}
              label={t('short.description')}
              name={`short_desc[${item.locale}]`}
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
        <Col span={24}>
          <CkeEditor languages={languages} form={form} lang={defaultLang} />
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
