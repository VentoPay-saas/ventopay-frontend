import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { AsyncSelect } from '../../../components/async-select';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import MediaUpload from '../../../components/upload';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import productService from '../../../services/seller/product';

const { TextArea } = Input;

export default function BoxForm({ form, handleSubmit }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  //states
  const [image, setImage] = useState(
    activeMenu.data?.image ? activeMenu.data?.image : []
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  //functions
  function fetchProductsStock() {
    return productService.getStock().then((res) =>
      res?.data.map((stock) => ({
        label:
          stock?.product?.translation?.title +
          ' ' +
          stock?.extras?.map((ext) => ext?.value).join(', '),
        value: stock?.id,
        key: stock?.id,
      }))
    );
  }

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values, image).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='box-form'
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'name' + item.id}
              label={t('name')}
              name={['title', item.locale]}
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
          {languages.map((item) => (
            <Form.Item
              key={'description' + item.id}
              label={t('description')}
              name={['description', item.locale]}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea maxLength={250} rows={3} />
            </Form.Item>
          ))}
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('discount.type')}
            name='discount_type'
            rules={[{ required: true, message: t('required') }]}
          >
            <Select
              options={[
                { label: t('fix'), value: 'fix' },
                { label: t('percent'), value: 'percent' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('discount.price')}
            name='discount_price'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber className='w-100' min={0} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.List
            name='stocks'
            initialValue={[{ stock_id: undefined, min_quantity: undefined }]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, i) => (
                  <Row gutter={12} align='middle'>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        label={t('stock')}
                        name={[name, 'stock_id']}
                        rules={[
                          {
                            required: true,
                            message: t('required'),
                          },
                        ]}
                      >
                        <AsyncSelect
                          fetchOptions={fetchProductsStock}
                          debounceTimeout={200}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        label={t('min.quantity')}
                        name={[name, 'min_quantity']}
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
                    {i !== 0 && (
                      <Col span={2} className='d-flex justify-content-end'>
                        <Button
                          onClick={() => remove(name)}
                          danger
                          className='w-100'
                          type='primary'
                          icon={<DeleteOutlined />}
                        />
                      </Col>
                    )}
                  </Row>
                ))}

                <Form.Item>
                  <Button onClick={() => add()} block icon={<PlusOutlined />}>
                    {t('add.stock')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>

        <Col span={12}>
          <Form.Item label={t('image')}>
            <MediaUpload
              type='boxes'
              imageList={image}
              setImageList={setImage}
              form={form}
              multiple={false}
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
