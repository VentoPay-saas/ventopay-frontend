import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import orderService from 'services/order';
import { addMenu, setRefetch } from 'redux/slices/menu';
import { transactionStatuses } from 'constants/index';
import { useNavigate } from 'react-router-dom';

export default function OrderStatusModal({
  orderDetails: data,
  handleCancel,
  status,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const settings = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );

  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState(status);

  const transactionOptions = transactionStatuses.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  useEffect(() => {
    const statusIndex = status.findIndex((item) => item.name === data.status);
    let newStatuses = [
      status[statusIndex],
      status[statusIndex + 1],
      { name: 'canceled', id: status?.length, active: true },
    ];
    if (statusIndex < 0) {
      newStatuses = [status[statusIndex + 1], 'canceled'];
    }
    setStatuses(newStatuses);
    // eslint-disable-next-line
  }, [data]);

  const goToInvoice = (id) => {
    const url = `orders/generate-invoice/${id}`;
    dispatch(
      addMenu({
        url,
        id: 'generate-invoice ',
        name: t('generate.invoice'),
      }),
    );
    navigate(`/${url}?print=true`);
  };

  const onFinish = (values) => {
    const params = {
      status: values?.status?.value || values?.status,
      transaction_status:
        values?.transaction_status?.value ||
        values?.transaction_status ||
        undefined,
    };
    setLoading(true);
    orderService
      .updateStatus(data.id, params)
      .then((res) => {
        if (
          res?.data?.status === 'accepted' &&
          settings?.auto_print_order === '1'
        ) {
          goToInvoice(res?.data?.id);
        } else {
          handleCancel();
          dispatch(setRefetch(activeMenu));
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={!!data}
      title={data.title}
      onCancel={handleCancel}
      footer={[
        <Button
          key='save-form'
          type='primary'
          onClick={() => form.submit()}
          loading={loading}
        >
          {t('save')}
        </Button>,
        <Button key='cansel-modal' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          status: data?.status,
          transaction_status: data?.transaction?.status,
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('status')}
              name='status'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select labelInValue>
                {statuses?.map((item) => (
                  <Select.Option key={item?.name} value={item?.name}>
                    {t(item?.name)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {data?.transaction && (
            <Col span={24}>
              <Form.Item
                label={t('transaction.status')}
                name='transaction_status'
              >
                <Select options={transactionOptions} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}
