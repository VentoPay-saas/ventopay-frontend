import React, { useMemo, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Switch,
} from 'antd';
import { useTranslation } from 'react-i18next';
import subscriptionService from '../../services/subscriptions';
import { AsyncSelect } from 'components/async-select';

export default function SubscriptionEditModal({
  modal,
  handleCancel,
  refetch,
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const onFinish = (values) => {
    const payload = {
      ...values,
      order_limit: modal.order_limit,
      plan_type: modal.plan_type,
      product_limit: modal.product_limit,
      title: modal.title,
      with_report: modal.with_report,
      subscription_options: values.subscription_options.map(
        (item) => item.value
      ),
      active: Number(values.active),
    };
    setLoadingBtn(true);
    subscriptionService
      .update(modal.id, payload)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };
  const selectedValue = useMemo(() => {
    if (!modal) return [];
    const options = modal.subscriptionOptions.map((item) => ({
      label: item.option_type,
      value: item.id,
    }));
    if (modal.subscriptionOptions?.length) return options;
    else return [];
  }, [modal]);

  async function fetchOptionList(search) {
    const params = { search };
    return subscriptionService.getOptions(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  return (
    <Modal
      visible={!!modal}
      title={t('edit.subscription')}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
          key='save-btn'
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel} key='cancel-btn'>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          active: true,
          subscription_options: selectedValue,
          ...modal,
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('type')}
              name='type'
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
          <Col span={24}>
            <Form.Item
              label={t('price')}
              name='price'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t('month')}
              name='month'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={t('options')} name='subscription_options'>
              <AsyncSelect
                mode='multiple'
                allowClear
                defaultValue={selectedValue}
                fetchOptions={fetchOptionList}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t('active')}
              name='active'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
