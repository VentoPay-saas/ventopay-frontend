import { Card, Col, Form, InputNumber, Row, Switch } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import useDemo from 'helpers/useDemo';
import useDebounce from 'helpers/useDebounce';
import useDidUpdate from 'helpers/useDidUpdate';

const Permission = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { isDemo } = useDemo();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [inputValue, setInputValue] = useState({
    orderAutoRemove: 0,
    splitMin: 0,
    splitMax: 0,
  });

  const debounceOrderAutoRemove = useDebounce(
    inputValue?.orderAutoRemove,
    1000,
  );
  const debounceSplitMin = useDebounce(inputValue?.splitMin, 1000);
  const debounceSplitMax = useDebounce(inputValue?.splitMax, 1000);

  useDidUpdate(() => {
    if (debounceOrderAutoRemove?.toString()?.length) {
      updateSettings({ order_auto_remove: debounceOrderAutoRemove });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceOrderAutoRemove]);

  useDidUpdate(() => {
    if (debounceSplitMin || debounceSplitMin === 0) {
      updateSettings({ split_min: debounceSplitMin });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSplitMin]);

  useDidUpdate(() => {
    if (debounceSplitMax || debounceSplitMax === 0) {
      updateSettings({ split_max: debounceSplitMax });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSplitMax]);

  const updateSettings = async (data) => {
    setLoadingBtn(true);
    await settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      initialValues={{
        ...activeMenu.data,
      }}
    >
      <Card title={t('permission')}>
        <Row gutter={24}>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('order.auto.approved')}</b>
                <p>
                  {t(
                    'When.you.create.the.status.of.the.order.you.choose.the.approved.status',
                  )}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='order_auto_approved' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ order_auto_approved: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('blog.active')}</b>
                <p>{t('You.choose.to.display.the.blog.page.yourself')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='blog_active' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ blog_active: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('prompt.email.modal')}</b>
                <p>{t('Send.sms.to.email.subscribers')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='prompt_email_modal' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ prompt_email_modal: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('referral.active')}</b>
                <p>{t('You.choose.whether.the.referral.will.work.or.not')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='referral_active' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ referral_active: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('aws.active')}</b>
                <p>{t('You.choose.whether.the.aws.will.work.or.not')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='aws' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    disabled={isDemo}
                    onChange={(e) => updateSettings({ aws: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('by.subscription')}</b>
                <p>
                  {t('You.choose.whether.the.by.subscription.will.work.or.not')}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='by_subscription' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    disabled={isDemo}
                    onChange={(e) => updateSettings({ by_subscription: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('reservation_enable_for_user')}</b>
                <p>
                  {t(
                    'You.choose.whether.enable.reservation.enable.for.user.or.not',
                  )}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item
                  name='reservation_enable_for_user'
                  valuePropName='checked'
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    disabled={isDemo}
                    onChange={(e) =>
                      updateSettings({ reservation_enable_for_user: e })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('is_demo')}</b>
                <p>{t('You.choose.whether.enable.is.demo.or.not')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='is_demo' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ is_demo: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('auto.approve.products')}</b>
                <p>{t('You.choose.whether.auto.approve.products.or.not')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='product_auto_approve' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => {
                      updateSettings({ product_auto_approve: e });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('auto.approve.categories')}</b>
                <p>{t('You.choose.whether.auto.approve.categories.or.not')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='category_auto_approve' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => {
                      updateSettings({ category_auto_approve: e });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('require.phone.for.create.order')}</b>
                <p>
                  {t(
                    'You.choose.whether.require.phone.number.or.not.for.create.order',
                  )}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item
                  name='before_order_phone_required'
                  valuePropName='checked'
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => {
                      updateSettings({ before_order_phone_required: e });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('auto.print.order')}</b>
                <p>{t('auto.print.when.order.status.changed.to.accepted')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Form.Item name='auto_print_order' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => {
                      updateSettings({ auto_print_order: e });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('order.auto.remove')}</b>
                <p>{t('Auto.removing.order')}</p>
              </Col>
              <Col span={12} className='mt-3'>
                <Form.Item
                  name='order_auto_remove'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber
                    onChange={(e) =>
                      setInputValue((prev) => {
                        return {
                          ...prev,
                          orderAutoRemove: e,
                        };
                      })
                    }
                    className='w-100'
                    placeholder={t('order.auto.remove')}
                    disabled={loadingBtn}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('split.min')}</b>
                <p>{t('split.min.description')}</p>
              </Col>
              <Col span={12} className='mt-3'>
                <Form.Item name='split_min'>
                  <InputNumber
                    min={0}
                    className='w-100'
                    onChange={(e) =>
                      setInputValue((prev) => {
                        return { ...prev, splitMin: e };
                      })
                    }
                    placeholder={t('split.min')}
                    disabled={loadingBtn}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('split.max')}</b>
                <p>{t('split.max.description')}</p>
              </Col>
              <Col span={12} className='mt-3'>
                <Form.Item name='split_max'>
                  <InputNumber
                    min={0}
                    className='w-100'
                    onChange={(e) =>
                      setInputValue((prev) => {
                        return { ...prev, splitMax: e };
                      })
                    }
                    placeholder={t('split.max')}
                    disabled={loadingBtn}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default Permission;
