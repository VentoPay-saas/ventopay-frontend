import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import MediaUpload from '../upload';
import { AppstoreOutlined, FileOutlined } from '@ant-design/icons';
import { RefetchSearch } from '../refetch-search';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import shopTagService from 'services/shopTag';
import userService from 'services/user';
import UserModal from 'components/shop/user-modal';
import CategoryModal from 'components/shop/category-modal';
import { orderPayments } from '../../constants';

const ShopFormData = ({
  backImage,
  setBackImage,
  logoImage,
  setLogoImage,
  form,
  user,
  setLocation,
  location,
}) => {
  const { t } = useTranslation();
  const [userModal, setUserModal] = useState(null);
  const [category, setCategory] = useState(null);
  const [userRefetch, setUserRefetch] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const sellerDocuments = activeMenu?.data?.documents || [];

  const orderPaymentOptions = orderPayments.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  async function fetchUserList(search) {
    const params = { search, roles: 'user', 'empty-shop': 1 };
    setUserRefetch(false);
    return userService.search(params).then((res) =>
      res.data.map((item) => ({
        label: item.firstname + ' ' + (item.lastname || ''),
        value: item._id,
      })),
    );
  }

  async function fetchShopTag(search) {
    setUserRefetch(false);
    const params = { search };
    return shopTagService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item?.title || 'no name',
        value: item._id,
      })),
    );
  }

  const goToAddClient = () => {
    setUserModal(true);
    setUserRefetch(true);
  };

  const handleCancel = () => {
    setUserModal(false);
    setCategory(false);
  };

  return (
    <Row gutter={12}>
      <Col span={24}>
        <Card>
          <Row gutter={12}>
            <Col span={4}>
              <Form.Item
                label={t('logo.image')}
                name='logo_img'
                rules={[
                  {
                    validator(_, value) {
                      if (logoImage?.length === 0) {
                        return Promise.reject(new Error(t('required')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
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
              <Form.Item
                label={t('background.image')}
                name='background_img'
                rules={[
                  {
                    validator(_, value) {
                      if (backImage?.length === 0) {
                        return Promise.reject(new Error(t('required')));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
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
              <Form.Item
                label={t('status.note')}
                name='status_note'
                rules={[
                  {
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(new Error(t('required')));
                      } else if (value && value?.trim() === '') {
                        return Promise.reject(new Error(t('no.empty.space')));
                      } else if (value && value?.length < 5) {
                        return Promise.reject(
                          new Error(t('must.be.at.least.5')),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <TextArea maxLength={250} rows={4} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name='status' label={t('status')}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name='open' label={t('open')} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card title={t('general')}>
          <Row gutter={12}>
            <Col span={12}>
              {/* {languages.map((item, idx) => (
                console.log("item:", item),

                <Form.Item
                  key={'title' + idx}
                  label={t('title')}
                  name={`title[${item.locale}]`}
                  rules={[
                    {
                      validator(_, value) {
                        if (!value && item?.locale === defaultLang) {
                          return Promise.reject(new Error(t('required')));
                        } else if (value && value?.trim() === '') {
                          return Promise.reject(new Error(t('no.empty.space')));
                        } else if (value && value?.length < 2) {
                          return Promise.reject(
                            new Error(t('must.be.at.least.2')),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <Input />
                </Form.Item>
              ))} */}

              <Form.Item
                key={'title'}
                label={t('title')}
                name={`title`}
                rules={[{ required: true, message: t('required') }]}

              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('phone')}
                name='phone'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('shop.tags')}
                name='tags'
                rules={[{ required: true, message: t('required') }]}
              >
                <RefetchSearch
                  mode='multiple'
                  fetchOptions={fetchShopTag}
                  refetch={userRefetch}
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

            <Col span={12}>
              <Form.Item
                label={t('seller')}
                name='user'
                rules={[{ required: true, message: t('required') }]}
              >
                <RefetchSearch
                  disabled={!user}
                  fetchOptions={fetchUserList}
                  refetch={userRefetch}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        className='w-100'
                        icon={<AppstoreOutlined />}
                        onClick={goToAddClient}
                      >
                        {t('add.user')}
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* {languages.map((item, idx) => (
                <Form.Item
                  key={'desc' + idx}
                  label={t('description')}
                  name={`description[${item.locale}]`}
                  rules={[
                    {
                      validator(_, value) {
                        if (!value && item?.locale === defaultLang) {
                          return Promise.reject(new Error(t('required')));
                        } else if (value && value?.trim() === '') {
                          return Promise.reject(new Error(t('no.empty.space')));
                        } else if (value && value?.length < 5) {
                          return Promise.reject(
                            new Error(t('must.be.at.least.5')),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <TextArea maxLength={250} rows={4} />
                </Form.Item>
              ))} */}

              <Form.Item
                key={'desc'}
                label={t('description')}
                name={`description`}
              >
                <TextArea maxLength={250} rows={4} />
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
                        <Tag li icon={<FileOutlined />}>
                          {item.title}
                        </Tag>
                      </a>
                    ))}
                  </Space>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>
      </Col>
      <Col span={24}>
        {/*<Card title={t('delivery')}>*/}
        {/*  <Row gutter={8}>*/}
        {/*    <Col span={12}>*/}
        {/*      <Form.Item*/}
        {/*          name='price'*/}
        {/*          label={t('min.price')}*/}
        {/*          rules={[{ required: true, message: t('required') }]}*/}
        {/*      >*/}
        {/*        <InputNumber min={0} className='w-100' />*/}
        {/*      </Form.Item>*/}
        {/*    </Col>*/}
        {/*    <Col span={12}>*/}
        {/*      <Form.Item*/}
        {/*          name='price_per_km'*/}
        {/*          label={t('price.per.km')}*/}
        {/*          rules={[{ required: true, message: t('required') }]}*/}
        {/*      >*/}
        {/*        <InputNumber min={0} className='w-100' />*/}
        {/*      </Form.Item>*/}
        {/*    </Col>*/}
        {/*  </Row>*/}
        {/*</Card>*/}
        <Card title={t('order.info')}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label={t('min.amount')}
                name='min_amount'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('tax')}
                name='tax'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  addonAfter={'%'}
                  className='w-100'
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('admin.commission')}
                name='percentage'
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  className='w-100'
                  addonAfter={'%'}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={12}>
        <Card title={t('shop.wifi')}>
          <Row gutter={12}>
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
      {userModal && (
        <UserModal visible={userModal} handleCancel={() => handleCancel()} />
      )}
      {category && (
        <CategoryModal visible={category} handleCancel={() => handleCancel()} />
      )}
    </Row>
  );
};

export default ShopFormData;
