import React, { useEffect, useState } from 'react';
import { Form, PageHeader, Row, Col, Button } from 'antd';
import UserInfo from './user-info';
import ProductInfo from './product-info';
import PreviewInfo from './preview-info';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from '../../../services/seller/order';
import {
  clearOrder,
  setOrderCurrency,
  setOrderData,
} from '../../../redux/slices/order';
import { useNavigate } from 'react-router-dom';
import { removeFromMenu } from '../../../redux/slices/menu';
import { fetchSellerOrders } from '../../../redux/slices/orders';
import transactionService from '../../../services/transaction';
import { useTranslation } from 'react-i18next';

export default function OrderAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { orderShops, data, total, coupons } = useSelector(
    (state) => state.order,
    shallowEqual
  );

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currencies } = useSelector((state) => state.currency, shallowEqual);

  useEffect(() => {
    return () => {
      const formData = form.getFieldsValue(true);
      const data = {
        ...formData,
      };
      dispatch(setOrderData(data));
    };
  }, []);

  useEffect(() => {
    if (activeMenu.refetch) {
      const currency = currencies.find((item) => item.default);
      dispatch(setOrderCurrency(currency));
      form.setFieldsValue({
        currency_id: currency.id,
      });
    }
  }, [activeMenu.refetch]);

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        setOrderId(res.data.id);
        dispatch(clearOrder());
      })
      .finally(() => setLoading(false));
  }

  const orderCreate = (data) => {
    const payment = {
      payment_sys_id: data.payment_type,
    };
    setLoading(true);
    orderService
      .create(data)
      .then((res) => createTransaction(res.data.id, payment))
      .catch(() => setLoading(false));
  };

  const onFinish = (values) => {
    const shops = [
      {
        shop_id: '',
        tax: '',
        coupon: '',
        products: orderShops.map((product) => ({
          id: product.id,
          price: product.price,
          qty: product.qty,
          tax: product.tax,
          discount: product.discount,
          total_price: product.total_price,
        })),
      },
    ];
    const totalPrice = total.order_total;
    const body = {
      shops,
      user_id: values.user?.value,
      total: totalPrice,
      currency_id: values.currency_id,
      rate: currencies.find((item) => item.id === values.currency_id)?.rate,
      payment_type: values.payment_type.value,
      note: values.note,
    };
    orderCreate(body);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    const nextUrl = 'seller/orders';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    dispatch(fetchSellerOrders());
  };

  return (
    <>
      <PageHeader
        title={t('new.order')}
        extra={
          <Button
            type='primary'
            loading={loading}
            onClick={() => form.submit()}
            disabled={!orderShops.length}
          >
            {t('create')}
          </Button>
        }
      />
      <Form
        name='order-form'
        form={form}
        layout='vertical'
        onFinish={onFinish}
        className='order-add'
        initialValues={{
          user: data.user || null,
          address: data.address || null,
          currency_id: data.currency.id,
          payment_type: data.payment_type || null,
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <ProductInfo form={form} />
          </Col>
          <Col span={8}>
            <UserInfo form={form} />
          </Col>
        </Row>

        {orderId ? (
          <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
        ) : (
          ''
        )}
      </Form>
    </>
  );
}
