import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { DebounceSelect } from '../../../components/search';
import { useTranslation } from 'react-i18next';
import sellerBookingZone from '../../../services/seller/booking-zone';
import { shallowEqual, useSelector } from 'react-redux';

export default function BookingForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);

  //functions
  function fetchZone(search) {
    return sellerBookingZone.getAll({ search }).then((res) =>
      res.data.map((item) => ({
        label: item?.translation?.title,
        value: item?.id,
        key: item?.id,
      })),
    );
  }

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='booking-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ ...activeMenu?.data }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('zona')}
            name={'shop_section_id'}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect fetchOptions={fetchZone} debounceTimeout={300} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label='name'
            name={`name`}
            rules={[{ required: true, message: 'required' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('chair.count')}
            name='chair_count'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('tax')}
            name='tax'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
