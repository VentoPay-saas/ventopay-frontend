import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Switch } from 'antd';
import CkeEditor from '../../components/ckeEditor';
import { typeList } from './type-list';
import MediaUpload from '../../components/upload';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function PageForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { pages } = useSelector((state) => state.pages, shallowEqual);

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image?.[0] ? activeMenu?.data?.image : [],
  );
  const [type, setType] = useState(
    activeMenu?.data?.type ? activeMenu?.data?.type : null,
  );

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='page-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'title' + item.locale}
              label={t('name')}
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
        <Col span={12} />
        <Col span={24}>
          <CkeEditor form={form} languages={languages} lang={defaultLang} />
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
              onChange={(e) => setType(e)}
              options={typeList.filter(
                (i) => !pages.some((e) => e.type === i.value),
              )}
              className='w-100'
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
        {type !== 'delivery' && type !== 'about' && (
          <>
            <Col span={12}>
              <Form.Item
                label={t('google_play_button_link')}
                name='google_play_button_link'
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('app_store_button_link')}
                name='app_store_button_link'
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>
          </>
        )}
        <Col span={12}>
          <Form.Item label={t('image')}>
            <MediaUpload
              type='receipts'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
            />
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
