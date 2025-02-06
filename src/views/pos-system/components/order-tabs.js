import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Space,
  Spin,
  InputNumber,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  CloseOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import userService from 'services/user';
import { isArray } from 'lodash';
import {
  addBag,
  removeBag,
  setCartData,
  setCurrency,
  setCurrentBag,
} from 'redux/slices/cart';
import { getCartData } from 'redux/selectors/cartSelector';
import { InfiniteSelect } from 'components/infinite-select';
import paymentService from 'services/rest/payment';
import { DebounceSelect } from 'components/search';
import PosUserModal from './pos-user-modal';

export default function OrderTabs() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { currencies, loading } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { currentBag, bags, currency } = useSelector(
    (state) => state.cart,
    shallowEqual,
  );
  const data = useSelector((state) => getCartData(state.cart));
  const cartData = useSelector((state) => getCartData(state.cart));
  const { before_order_phone_required } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );

  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(null);
  const [hasMore, setHasMore] = useState({ user: false });

  const fetchPaymentList = async (search = '') => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page: 1,
    };
    return await paymentService.getAll(params).then((res) =>
      res?.data
        ?.filter((item) => item?.tag === 'cash' || item?.tag === 'wallet')
        .map((item) => ({
          label: t(item?.tag),
          value: item?._id,
          key: item?._id,
        })),
    );
  };

  async function getUsers({ search = '', page }) {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
    };
    return userService.getAll(params).then((res) => {
      setUsers(res.data);
      setHasMore((prev) => ({ ...prev, user: !!res?.links?.next }));
      return formatUser(res.data);
    });
  }


  function formatUser(data) {
    if (!data) return;
    if (isArray(data)) {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname ? item.lastname : ''}`,
        value: item._id,
      }));
    } else {
      return {
        label: `${data.firstname} ${data.lastname}`,
        value: data._id,
      };
    }
  }

  function selectUser(userObj) {
    const user = users.find((item) => item._id === userObj.value);
    dispatch(
      setCartData({
        user: userObj,
        userUuid: user._id,
        bag_id: currentBag,
        userOBJ: user,
        phone: user?.phone,
      }),
    );
    form.setFieldsValue({ address: null, phone: user?.phone });
  }

  const goToAddClient = () => setUserModal(true);

  const closeTab = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(removeBag(item));
  };

  function selectCurrency(item) {
    const currentCurrency = currencies.find((el) => el.id === item.value);
    dispatch(setCurrency(currentCurrency));
  }

  useEffect(() => {
    if (!currency) {
      const currentCurrency = currencies.find((item) => item.default);
      const formCurrency = {
        label: `${currentCurrency?.title} (${currentCurrency?.symbol})`,
        value: currentCurrency?._id,
      };
      dispatch(
        setCartData({
          currentCurrency,
          bag_id: currentBag,
        }),
      );
      dispatch(setCurrency(currentCurrency));
      form.setFieldsValue({
        currency: formCurrency,
      });
    } else {
      const formCurrency = {
        label: `${currency?.title} (${currency?.symbol})`,
        value: currency?._id,
        key: currency?._id,
      };
      dispatch(
        setCartData({
          formCurrency,
          bag_id: currentBag,
        }),
      );
      form.setFieldsValue({
        currency: formCurrency,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      user: data?.user || null,
      payment_type: data?.paymentType || null,
      phone: data?.phone || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBag, data]);

  return (
    <div className='order-tabs'>
      <div className='tabs-container'>
        <div className='tabs'>
          {bags.map((item) => (
            <div
              key={'tab' + item}
              className={item === currentBag ? 'tab active' : 'tab'}
              onClick={() => dispatch(setCurrentBag(item))}
            >
              <Space>
                <ShoppingCartOutlined />
                <span>
                  {t('bag')} - {item + 1}
                </span>
                {!!item && item === currentBag && (
                  <CloseOutlined
                    onClick={(event) => closeTab(event, item)}
                    className='close-button'
                    size={12}
                  />
                )}
              </Space>
            </div>
          ))}
        </div>
        <Button
          size='small'
          type='primary'
          shape='circle'
          icon={<PlusOutlined />}
          className='tab-add-button'
          onClick={() => dispatch(addBag({ shop: cartData.shop }))}
        />
      </div>
      <Form
        layout='vertical'
        name='pos-form'
        form={form}
        initialValues={{
          user: data.user || null,
          currency: currency || undefined,
          payment_type: data.paymentType || null,
          delivery: {
            label: 'pickup',
            value: '0',
          },
          phone: data.phone || null,
        }}
      >
        <Card className={!!currentBag ? '' : 'tab-card'}>
          {loading && (
            <div className='loader'>
              <Spin />
            </div>
          )}

          <Row gutter={6} style={{ marginBottom: 15 }}>
            <Col span={21}>
              <Form.Item
                name='user'
                rules={[{ required: true, message: 'required' }]}
                className='w-100'
              >
                <InfiniteSelect
                  hasMore={hasMore?.user}
                  placeholder={t('select.client')}
                  fetchOptions={getUsers}
                  onSelect={selectUser}
                  onClear={() => {
                    form.setFieldsValue({ phone: null, user: null });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Form.Item>
                <Button icon={<UserAddOutlined />} onClick={goToAddClient} />
              </Form.Item>
            </Col>
            {before_order_phone_required === '1' && (
              <Col span={24}>
                <Form.Item
                  name='phone'
                  rules={[
                    { required: true, message: t('required') },
                    {
                      pattern: /^[0-9\b]+$/,
                      message: t('phone.invalid'),
                    },
                  ]}
                >
                  <InputNumber
                    className='w-100'
                    placeholder={t('phone.number')}
                    disabled={data?.userOBJ?.phone}
                    onChange={(phone) =>
                      dispatch(
                        setCartData({ phone: phone, bag_id: currentBag }),
                      )
                    }
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name='currency'
                rules={[{ required: true, message: 'missing_currency' }]}
              >
                <Select
                  placeholder={t('select.currency')}
                  onSelect={selectCurrency}
                  labelInValue
                  disabled
                  onChange={(e) => {
                    dispatch(
                      setCartData({
                        currency: e,
                        bag_id: currentBag,
                      }),
                    );
                  }}
                >
                  {currencies.map((item, index) => (
                    <Select.Option key={index} value={item?.id}>
                      {`${item?.title} (${item?.symbol})`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='payment_type'
                rules={[{ required: true, message: t('required') }]}
              >
                <DebounceSelect
                  fetchOptions={fetchPaymentList}
                  allowClear={false}
                  placeholder={t('select.payment.method')}
                  onSelect={(paymentType) => {
                    dispatch(setCartData({ paymentType, bag_id: currentBag }));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      {!!userModal && (
        <PosUserModal
          visible={userModal}
          handleCancel={() => setUserModal(false)}
        />
      )}
    </div>
  );
}
