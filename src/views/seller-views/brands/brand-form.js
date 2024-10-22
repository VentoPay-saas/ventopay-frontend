import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Switch } from 'antd';
import MediaUpload from '../../../components/upload';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function BrandForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  // states
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : [],
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='basic'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('title')}
            name={'title'}
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
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={6}>
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
              type='brands'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
          </Form.Item>
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
