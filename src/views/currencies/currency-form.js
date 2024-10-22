import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import currency from '../../helpers/currnecy.json';

export default function CurrencyForm({
  form,
  handleSubmit,
  isDefault = false,
}) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  // states
  const [loadingBtn, setLoadingBtn] = useState(false);

  // constants
  const options = currency.map((item) => ({
    label: `${item?.name?.toUpperCase()} ( ${item?.symbol_native} )`,
    value: item?.code,
    symbol: item?.symbol_native,
  }));

  // submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    handleSubmit(values).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      name='currency-form'
      onFinish={onFinish}
      form={form}
      layout='vertical'
      initialValues={{
        ...activeMenu.data,
        active: true,
        position: 'before',
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('title')}
            name='title'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              onChange={(e, i) => form.setFieldsValue({ symbol: i.symbol })}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
              showSearch
              allowClear
              options={options}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('symbol')}
            name='symbol'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('rate')}
            name='rate'
            rules={[
              {
                required: true,
                message: t('required'),
              },
              {
                type: 'number',
                min: 0,
                message: t('must.be.positive'),
              },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('symbol_position')}
            name='position'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              onChange={(value) => form.setFieldsValue({ position: value })}
              options={[
                { label: t('after'), value: 'after' },
                { label: t('before'), value: 'before' },
              ]}
              defaultValue='before'
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch disabled={isDefault} />
          </Form.Item>
        </Col>
      </Row>
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('submit')}
      </Button>
    </Form>
  );
}
