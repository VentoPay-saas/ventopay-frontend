import React from 'react';
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
} from 'antd';
import { DebounceSelect } from '../../../components/search';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MediaUpload from '../../../components/upload';
import shopTagService from 'services/shopTag';
import { orderPayments } from '../../../constants';
import { FileOutlined } from '@ant-design/icons';

const ShopAddData = ({
  logoImage,
  setLogoImage,
  backImage,
  setBackImage,
  form,
  location,
  setLocation,
}) => {
  const { t } = useTranslation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const sellerDocuments = activeMenu?.data?.documents || [];

  const orderPaymentOptions = orderPayments.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  async function fetchShopTag(search) {
    const params = { search };
    return shopTagService.getAllSeller(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
      })),
    );
  }

  return (
    <Row gutter={12}>
      <Col span={24}>
        <Card>
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item label={t('logo.image')}>
                <MediaUpload
                  type='shops/logo'
                  imageList={logoImage}
                  setImageList={setLogoImage}
                  form={form}
                  multiple={false}
                  name='logo_img'
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label={t('background.image')}>
                <MediaUpload
                  type='shops/background'
                  imageList={backImage}
                  setImageList={setBackImage}
                  form={form}
                  multiple={false}
                  name='background_img'
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label={t('status.note')} name='status_note'>
                <TextArea maxLength={250} rows={4} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name='status' label={t('status')}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={t('general')}>
          <Row gutter={12}>
            <Col span={12}>
              <Row gutter={12}>
                <Col span={24}>
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
                        { min: 2, message: t('title.required') },
                      ]}
                      hidden={item.locale !== defaultLang}
                    >
                      <Input />
                    </Form.Item>
                  ))}
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('phone')}
                    name='phone'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              {languages.map((item, idx) => (
                <Form.Item
                  key={'desc' + idx}
                  label={t('description')}
                  name={`description[${item.locale}]`}
                  rules={[
                    {
                      required: item.locale === defaultLang,
                      message: t('required'),
                    },
                    { min: 3, message: t('required') },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <TextArea maxLength={250} rows={4} />
                </Form.Item>
              ))}
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('shop.tags')}
                name='tags'
                rules={[{ required: false, message: t('required') }]}
              >
                <DebounceSelect
                  mode='multiple'
                  fetchOptions={fetchShopTag}
                  style={{ minWidth: 150 }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name='order_payment'
                rules={[{ required: true, message: t('required') }]}
                label={t('order.payment')}
              >
                <Select options={orderPaymentOptions} />
              </Form.Item>
            </Col>

            <Col span={8} hidden>
              <Form.Item
                label={t('seller')}
                name='user'
                rules={[{ required: true, message: t('required') }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {!!sellerDocuments?.length && (
              <Col span={24}>
                <Form.Item label={t('documents')}>
                  <Space gap='4px 0' wrap>
                    {sellerDocuments.map((item) => (
                      <a
                        href={item.path}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Tag icon={<FileOutlined />}>{item.title}</Tag>
                      </a>
                    ))}
                  </Space>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>
      </Col>

      {/*<Col span={8}>*/}
      {/*  <Card title={t('delivery')}>*/}
      {/*    <Row gutter={8}>*/}
      {/*      <Col span={12}>*/}
      {/*        <Form.Item*/}
      {/*          name='price'*/}
      {/*          label={t('min.price')}*/}
      {/*          rules={[{ required: true, message: t('required') }]}*/}
      {/*        >*/}
      {/*          <InputNumber className='w-100' />*/}
      {/*        </Form.Item>*/}
      {/*      </Col>*/}
      {/*      <Col span={12}>*/}
      {/*        <Form.Item*/}
      {/*          name='price_per_km'*/}
      {/*          label={t('price.per.km')}*/}
      {/*          rules={[{ required: true, message: t('required') }]}*/}
      {/*        >*/}
      {/*          <InputNumber className='w-100' />*/}
      {/*        </Form.Item>*/}
      {/*      </Col>*/}
      {/*    </Row>*/}
      {/*  </Card>*/}
      {/*</Col>*/}
      <Col span={12}>
        <Card title={t('order.info')}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('min.amount')}
                name='min_amount'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('tax')}
                name='tax'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} addonAfter={'%'} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('admin.comission')}
                name='percentage'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' addonAfter={'%'} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={12}>
        <Card title={t('shop.wifi')}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='wifi_name' label={t('wifi.name')}>
                <Input className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='wifi_password' label={t('wifi.password')}>
                <Input className='w-100' />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      {/*<Col span={24}>*/}
      {/*  <Card title={t('address')}>*/}
      {/*    <Row gutter={12}>*/}
      {/*      <Col span={12}>*/}
      {/*        {languages.map((item, idx) => (*/}
      {/*          <Form.Item*/}
      {/*            key={'address' + idx}*/}
      {/*            label={t('address')}*/}
      {/*            name={`address[${item.locale}]`}*/}
      {/*            rules={[*/}
      {/*              {*/}
      {/*                required: item.locale === defaultLang,*/}
      {/*                message: t('required'),*/}
      {/*              },*/}
      {/*            ]}*/}
      {/*            hidden={item.locale !== defaultLang}*/}
      {/*          >*/}
      {/*            <Select*/}
      {/*              allowClear*/}
      {/*              searchValue={value}*/}
      {/*              showSearch*/}
      {/*              autoClearSearchValue*/}
      {/*              loading={isPlacePredictionsLoading}*/}
      {/*              options={placePredictions?.map((prediction) => ({*/}
      {/*                label: prediction.description,*/}
      {/*                value: prediction.description,*/}
      {/*              }))}*/}
      {/*              onSearch={(searchValue) => {*/}
      {/*                setValue(searchValue);*/}
      {/*                if (searchValue.length > 0) {*/}
      {/*                  getPlacePredictions({ input: searchValue });*/}
      {/*                }*/}
      {/*              }}*/}
      {/*              onSelect={async (value) => {*/}
      {/*                const address = await getAddress(value);*/}
      {/*                setLocation({*/}
      {/*                  lat: address?.geometry.location.lat,*/}
      {/*                  lng: address?.geometry.location.lng,*/}
      {/*                });*/}
      {/*              }}*/}
      {/*            />*/}
      {/*          </Form.Item>*/}
      {/*        ))}*/}
      {/*      </Col>*/}
      {/*      <Col span={24}>*/}
      {/*        <Map*/}
      {/*          location={location}*/}
      {/*          setLocation={setLocation}*/}
      {/*          setAddress={(value) =>*/}
      {/*            form.setFieldsValue({ [`address[${defaultLang}]`]: value })*/}
      {/*          }*/}
      {/*        />*/}
      {/*      </Col>*/}
      {/*    </Row>*/}
      {/*  </Card>*/}
      {/*</Col>*/}
    </Row>
  );
};

export default ShopAddData;
