import React, { useState } from 'react';
import { Button, Col, Form, Input, Row } from 'antd';
import MediaUpload from '../../components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

export default function ShopTagForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.images ? activeMenu.data?.images : [],
  );

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='shop-tag-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ clickable: true, ...activeMenu.data }}
      className='d-flex flex-column h-100'
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
        <Col span={12}>
          <Form.Item
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
            label={t('image')}
            name='images'
          >
            <MediaUpload
              type='products'
              imageList={image}
              setImageList={setImage}
              form={form}
              length='1'
              multiple={false}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button
            type='primary'
            htmlType='submit'
            loading={loadingBtn}
            disabled={loadingBtn}
          >
            {t('submit')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
