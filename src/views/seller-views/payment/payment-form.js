import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import paymentService from 'services/seller/payment';
import { AsyncSelect } from 'components/async-select';

export default function PaymentForm({ form, handleSubmit, type = 'add' }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  //states
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [activePayment, setActivePayment] = useState(
    activeMenu?.data?.activePayment,
  );

  //functions
  async function fetchPayment() {
    return paymentService.allPayment().then(({ data }) =>
      data.map((item) => ({
        label: item?.tag[0].toUpperCase() + item?.tag.substring(1),
        value: item?.id,
        key: item?.id,
      })),
    );
  }

  //submit form
  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      ...values,
      activePayment,
    };

    handleSubmit(body).finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      layout='vertical'
      name='user-address'
      form={form}
      onFinish={onFinish}
      initialValues={{ status: true, ...activeMenu?.data }}
    >
      <Row gutter={12}>
        <Col
          span={
            activePayment?.label.toLowerCase() === 'cash' ||
            activePayment?.label.toLowerCase() === 'wallet'
              ? 12
              : 24
          }
        >
          <Form.Item
            label={t('payment')}
            name='payment_id'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <AsyncSelect
              fetchOptions={fetchPayment}
              onSelect={(e) => setActivePayment(e)}
              disabled={type === 'edit'}
            />
          </Form.Item>
        </Col>

        {activePayment?.label.toLowerCase() === 'cash' ||
        activePayment?.label.toLowerCase() === 'wallet' ? (
          ''
        ) : (
          <>
            <Col span={12}>
              <Form.Item
                label={t('client.id')}
                name={'client_id'}
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('secret.id')}
                name={'secret_id'}
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            {activePayment?.label === 'Paystack' ? (
              <>
                <Col span={12}>
                  <Form.Item
                    label={t('payment.id')}
                    name={'payment_key'}
                    rules={[
                      {
                        required: true,
                        message: t('required'),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('merchant.email')}
                    name={'merchant_email'}
                    rules={[
                      {
                        required: true,
                        message: t('required'),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </>
            ) : (
              ''
            )}
          </>
        )}
        <Col span={12}>
          <Form.Item label={t('status')} name='status' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <div className='flex-grow-1 d-flex flex-column justify-content-end'>
        <div className='pb-5'>
          <Button
            type='primary'
            htmlType='submit'
            loading={loadingBtn}
            disabled={loadingBtn}
          >
            {t('submit')}
          </Button>
        </div>
      </div>
    </Form>
  );
}
