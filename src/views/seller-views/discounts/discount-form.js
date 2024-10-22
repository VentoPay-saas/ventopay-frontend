import React, { useState } from 'react';
import { Button, Col, DatePicker, Form, InputNumber, Row, Select } from 'antd';
import moment from 'moment/moment';
import { DebounceSelect } from '../../../components/search';
import MediaUpload from '../../../components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import productService from '../../../services/seller/product';

export default function DiscountForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : [],
  );

  //functions
  async function fetchProducts(search) {
    const params = {
      search,
      shop_id: shop.id,
      status: 'published',
      active: 1,
      rest: 1,
    };
    return productService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      })),
    );
  }
  const getInitialValues = () => {
    const data = activeMenu.data;
    if (!activeMenu.data?.start) {
      return data;
    }
    const start = activeMenu.data.start;
    const end = activeMenu.data.end;
    return {
      ...data,
      start: moment(start, 'YYYY-MM-DD'),
      end: moment(end, 'YYYY-MM-DD'),
    };
  };

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='discount-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ ...getInitialValues() }}
      className='d-flex flex-column h-100'
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('type')}
            name={'type'}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select>
              <Select.Option value='fix'>{t('fix')}</Select.Option>
              <Select.Option value='percent'>{t('percent')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('price')}
            name='price'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('start.date')}
            name='start'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DatePicker
              className='w-100'
              placeholder=''
              disabledDate={(current) => moment().add(-1, 'days') >= current}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('end.date')}
            name='end'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DatePicker
              className='w-100'
              placeholder=''
              disabledDate={(current) => moment().add(-1, 'days') >= current}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('products')}
            name='products'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect fetchOptions={fetchProducts} mode='multiple' />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('image')}
            name='images'
            rules={[
              {
                required: !image.length,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='discounts'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
              name='image'
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
