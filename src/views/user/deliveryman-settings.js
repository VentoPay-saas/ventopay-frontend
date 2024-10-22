import { Col, Form, Input, Row, Select, InputNumber, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import MediaUpload from '../../components/upload';
import Map from '../../components/map';

const type_of_technique = [
  { label: 'Benzine', value: 'benzine' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Gas', value: 'gas' },
  { label: 'Motorbike', value: 'motorbike' },
  { label: 'Bike', value: 'bike' },
  { label: 'Foot', value: 'foot' },
  { label: 'Electric', value: 'electric' },
];

const DelivertSetting = ({ location, setLocation, form, image, setImage }) => {
  const { t } = useTranslation();

  return (
    <Row gutter={12}>
      <Col span={12}>
        <Form.Item
          label={t('brand')}
          name='brand'
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
      <Col span={12}>
        <Form.Item
          label={t('model')}
          name='model'
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
      <Col span={12}>
        <Form.Item
          label={t('type.of.technique')}
          name='type_of_technique'
          rules={[
            {
              required: true,
              message: t('required'),
            },
          ]}
        >
          <Select options={type_of_technique} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('car.number')}
          name='number'
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
      <Col span={12}>
        <Form.Item
          label={t('car.color')}
          name='color'
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
      <Col span={12}>
        <Form.Item
          label={t('height')}
          name='height'
          rules={[
            {
              validator(_, value) {
                if (!value && value !== 0) {
                  return Promise.reject(new Error(t('required')));
                } else if (!value || value < 1) {
                  return Promise.reject(new Error(t('min.1')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className='w-100' addonAfter='sm' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('weight')}
          name='kg'
          rules={[
            {
              validator(_, value) {
                if (!value && value !== 0) {
                  return Promise.reject(new Error(t('required')));
                } else if (!value || value < 1) {
                  return Promise.reject(new Error(t('min.1')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className='w-100' addonAfter='kg' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('length')}
          name='length'
          rules={[
            {
              validator(_, value) {
                if (!value && value !== 0) {
                  return Promise.reject(new Error(t('required')));
                } else if (!value || value < 1) {
                  return Promise.reject(new Error(t('min.1')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className='w-100' addonAfter='sm' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('width')}
          name='width'
          rules={[
            {
              validator(_, value) {
                if (!value && value !== 0) {
                  return Promise.reject(new Error(t('required')));
                } else if (!value || value < 1) {
                  return Promise.reject(new Error(t('min.1')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className='w-100' addonAfter='sm' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('image')}
          name='images'
          rules={[
            {
              validator() {
                if (image?.length === 0) {
                  return Promise.reject(new Error(t('required')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <MediaUpload
            type='deliveryman/settings'
            imageList={image}
            setImageList={setImage}
            form={form}
            length='1'
            multiple={true}
          />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item
          label={t('online')}
          name='online'
          rules={[{ required: true, message: t('required') }]}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label={t('map')} name='location'>
          <Map location={location} setLocation={setLocation} />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default DelivertSetting;
