import { Button, Col, Divider, Form, Row, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { transactionStatuses } from 'constants/index';
import { useState } from 'react';
import orderService from 'services/order';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { setRefetch } from 'redux/slices/menu';

const OrderTransactionStatusModal = ({
  orderId,
  status,
  onCancel,
  refreshOrders,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const options = transactionStatuses.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  const onFinish = (values) => {
    const body = {
      status: values?.status?.value,
    };
    setLoadingBtn(true);

    orderService.updateTransactionStatus(orderId, body).finally(() => {
      setLoadingBtn(false);

      onCancel();

      if (refreshOrders) {
        refreshOrders();
      } else {
        dispatch(setRefetch(activeMenu));
      }
    });
  };

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{ status }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            label={t('status')}
            name='status'
            rules={[{ required: true, message: t('required') }]}
          >
            <Select options={options} labelInValue />
          </Form.Item>
        </Col>
        <Divider />
        <Col span={24}>
          <Space style={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={onCancel}>{t('cancel')}</Button>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('save')}
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default OrderTransactionStatusModal;
