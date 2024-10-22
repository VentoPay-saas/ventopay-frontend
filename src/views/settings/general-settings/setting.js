import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { shallowEqual, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ImageUploadSingle from '../../../components/image-upload-single';
import settingService from '../../../services/settings';
import { Time } from './deliveryman_time';
import { fetchSettings as getSettings } from '../../../redux/slices/globalSettings';
import useDemo from '../../../helpers/useDemo';

const Setting = ({ setFavicon, favicon, setLogo, logo }) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [form] = Form.useForm();
  const { isDemo } = useDemo();

  function updateSettings(data) {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  }

  const onFinish = (values) => {
    const body = {
      ...values,
      favicon: favicon.name,
      logo: logo.name,
    };
    updateSettings(body);
  };

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      onFinish={onFinish}
      initialValues={{
        delivery: '1',
        // payment_type: 'admin',
        ...activeMenu.data,
        recommended_count: Number(activeMenu.data?.recommended_count) || 1,
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('title')}
            name='title'
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
        {/*<Col span={12}>*/}
        {/*  <Form.Item*/}
        {/*    label={t('commission')}*/}
        {/*    name='commission'*/}
        {/*    rules={[*/}
        {/*      {*/}
        {/*        required: true,*/}
        {/*        message: t('required'),*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*  >*/}
        {/*    <InputNumber min={0} className='w-100' />*/}
        {/*  </Form.Item>*/}
        {/*</Col>*/}
        <Col span={12}>
          <Form.Item
            label={t('qrcode.base.url')}
            name='qrcode_base_url'
            rules={[
              {
                type: 'url',
                message: t('invalid.url'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        {/*<Col span={12}>*/}
        {/*  <Form.Item*/}
        {/*    label={t('payment.type')}*/}
        {/*    name='payment_type'*/}
        {/*    rules={[*/}
        {/*      {*/}
        {/*        required: true,*/}
        {/*        message: t('required'),*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*  >*/}
        {/*    <Select>*/}
        {/*      <Select.Option value='admin'>{t('admin')}</Select.Option>*/}
        {/*      <Select.Option value='seller'>{t('seller')}</Select.Option>*/}
        {/*    </Select>*/}
        {/*  </Form.Item>*/}
        {/*</Col>*/}
        <Col span={12}>
          <Form.Item
            label={t('service.fee')}
            name='service_fee'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InputNumber
              min={0}
              className='w-100'
              addonBefore={defaultCurrency?.symbol}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('recommended.count')}
            name='recommended_count'
            rules={[
              {
                type: 'number',
                min: 1,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={1} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space>
            <Form.Item
              label={t('favicon')}
              name='favicon'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='languages'
                image={favicon}
                setImage={setFavicon}
                form={form}
                name='favicon'
              />
            </Form.Item>
            <Form.Item
              label={t('logo')}
              name='logo'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='languages'
                image={logo}
                setImage={setLogo}
                form={form}
                name='logo'
              />
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Button
        onClick={() => form.submit()}
        type='primary'
        disabled={isDemo}
        loading={loadingBtn}
      >
        {t('save')}
      </Button>
    </Form>
  );
};

export default Setting;
