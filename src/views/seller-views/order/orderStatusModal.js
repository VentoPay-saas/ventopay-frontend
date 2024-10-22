import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import orderService from 'services/seller/order';
import { addMenu, setRefetch } from 'redux/slices/menu';
import { transactionStatuses } from 'constants/index';
import { useNavigate } from 'react-router-dom';

export default function OrderStatusModal({ orderDetails: data, handleCancel }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const settings = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );

  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([
    { id: 0, name: 'all', active: true, sort: 0 },
    ...activeStatusList,
    {
      id: activeStatusList?.length + 1,
      name: 'canceled',
      active: true,
      sort: 8,
    },
  ]);

  const transactionOptions = transactionStatuses.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  useEffect(() => {
    const statusIndex = statuses.findIndex(
      (item) => item.name === data?.status,
    );

    let newStatuses = [
      statuses[statusIndex],
      statuses[statusIndex + 1],
      statuses[activeStatusList?.length + 1],
    ];

    if (statusIndex < 0) {
      newStatuses = [
        statuses[statusIndex + 1],
        statuses[activeStatusList?.length + 1],
      ];
    }

    // eslint-disable-next-line array-callback-return
    newStatuses.map((status, idx, array) => {
      if (status.name === data?.status) {
        setStatuses(array.slice(idx));
      }
    });
    // eslint-disable-next-line
  }, [data]);

  const goToInvoice = (id) => {
    const url = `seller/generate-invoice/${id}`;
    dispatch(
      addMenu({
        url,
        id: 'seller-generate-invoice ',
        name: t('generate.invoice'),
      }),
    );
    navigate(`/${url}?print=true`);
  };

  const onFinish = (values) => {
    setLoading(true);
    const params = {
      status: values?.status?.value || values?.status,
      transaction_status:
        values?.transaction_status?.value ||
        values?.transaction_status ||
        undefined,
    };
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
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          status: data.status,
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
              <Select>
                {statuses?.map((item) => (
                  <Select.Option key={item.id} value={item.name}>
                    {t(item.name)}
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
