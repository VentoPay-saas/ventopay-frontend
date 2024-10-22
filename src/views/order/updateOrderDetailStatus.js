import { Button, Col, Divider, Form, Row, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { ORDER_DETAILS_STATUSES } from 'constants/index';
import { useState } from 'react';
import orderService from 'services/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setRefetch } from 'redux/slices/menu';

const UpdateOrderDetailStatus = ({ orderDetailId, status, handleCancel }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loadingBtn, setLoadingBtn] = useState(false);

  const statusOptions = ORDER_DETAILS_STATUSES.map((item) => ({
    label: t(item),
    value: item,
    key: item,
  }));

  const onFinish = (values) => {
    const body = {
      status: values?.status?.value,
    };
    setLoadingBtn(true);
    orderService
      .updateOrderDetailStatus(orderDetailId, body)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{
        status: statusOptions.find((item) => item?.value === status),
      }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            name='status'
            label={t('status')}
            rules={[{ required: true, message: t('required') }]}
          >
            <Select labelInValue options={statusOptions} />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Space>
        <Button onClick={handleCancel}>{t('cancel')}</Button>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Space>
    </Form>
  );
};

export default UpdateOrderDetailStatus;
