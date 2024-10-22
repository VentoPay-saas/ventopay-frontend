import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import MediaUpload from '../../../components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

export default function ZoneForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : [],
  );

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='zone-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'title' + item.id}
              label={t('title')}
              name={['title', item.locale]}
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
        <Col span={12}>
          <Form.Item
            label={t('area')}
            name='area'
            rules={[
              { required: true, message: t('required') },
              { type: 'number', min: 1, message: t('must.be.at.least.1') },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                required: image?.length === 0,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='shop-galleries'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={true}
            />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
