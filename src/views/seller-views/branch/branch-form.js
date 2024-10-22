import React, { useState } from 'react';
import { Button, Col, Form, Input, Row } from 'antd';
import Map from 'components/map';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import getDefaultLocation from 'helpers/getDefaultLocation';
import { usePlacesWidget } from 'react-google-autocomplete';
import { MAP_API_KEY } from 'configs/app-global';

export default function BranchForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );
  const { google_map_key } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );
  const { ref } = usePlacesWidget({
    apiKey: google_map_key || MAP_API_KEY,
    onPlaceSelected: (place) => {
      const location = {
        lat: place?.geometry.location.lat(),
        lng: place?.geometry.location.lng(),
      };
      setLocation(location);
      form.setFieldsValue({
        [`address[${defaultLang}]`]: place?.formatted_address,
      });
    },
  });

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [location, setLocation] = useState(
    activeMenu?.data?.mapCoordinates ?? getDefaultLocation(settings),
  );

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    const payload = {
      ...values,
      location,
    };
    handleSubmit(payload).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='branch-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ ...activeMenu.data }}
      className='d-flex flex-column h-100'
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
          <Form.Item
            label={t('address')}
            name={`address`}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <input className='address-input' ref={ref} placeholder={''} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Map
            location={location}
            setLocation={setLocation}
            setAddress={(value) => form.setFieldsValue({ address: value })}
          />
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
