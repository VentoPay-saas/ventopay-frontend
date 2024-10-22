import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from 'redux/slices/menu';
import LanguageList from 'components/language-list';
import { useTranslation } from 'react-i18next';
import subscriptionService from 'services/subscriptions';
import { fetchSubscription } from 'redux/slices/subscription';

export default function NotificationAdd() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);

      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  function getTranslationFields(values, field = 'title') {
    const list = languages.map((item) => ({
      [item.locale]: values[`${field}[${item.locale}]`],
    }));
    return Object.assign({}, ...list);
  }

  const onFinish = (values) => {
    const body = {
      limit: values.limit,
      option_type: values.option_type,
      title: getTranslationFields(values),
    };

    setLoadingBtn(true);
    const nextUrl = 'subscription/options';
    subscriptionService
      .addOption(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchSubscription({}));
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('add.subscription')} extra={<LanguageList />}>
      <Form
        name='subscription-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{
          option_type: 'category',
          ...activeMenu.data,
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'title' + item.locale}
                label={t('title')}
                name={`title[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            <Form.Item
              key='limit'
              label={t('limit')}
              name='limit'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              key='option_type'
              label={t('option_type')}
              name='option_type'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select defaultValue={'category'}>
                <Select.Option value={'category'}>
                  {t('category')}
                </Select.Option>
                <Select.Option value={'product'}>{t('product')}</Select.Option>
                <Select.Option value={'table'}>{t('table')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
