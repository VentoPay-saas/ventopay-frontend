import React, { useEffect, useState } from 'react';
import { Form, PageHeader, Row, Col } from 'antd';
import UserInfo from './user-info';
import ProductInfo from './product-info';
import PreviewInfo from './preview-info';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from '../../services/order';
import {
  clearOrder,
  setCurrentShop,
  setOrderCurrency,
  setOrderData,
} from '../../redux/slices/order';
import { useNavigate } from 'react-router-dom';
import { disableRefetch, removeFromMenu } from '../../redux/slices/menu';
import { fetchOrders } from '../../redux/slices/orders';
import transactionService from '../../services/transaction';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export default function OrderAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { orderProducts, data, total, coupon } = useSelector(
    (state) => state.order,
    shallowEqual
  );

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const { allShops } = useSelector((state) => state.allShops, shallowEqual);

  useEffect(() => {
    return () => {
      const formData = form.getFieldsValue(true);
      const data = {
        ...formData,
      };
      dispatch(setOrderData(data));
    };
  }, []);

  function getFirstShopFromList(shops) {
    if (!shops.length) {
      return null;
    }
    return {
      label: shops[0].translation?.title,
      value: shops[0].id,
    };
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      const currency = currencies.find((item) => item.default);
      dispatch(setCurrentShop(getFirstShopFromList(allShops)));
      dispatch(setOrderCurrency(currency));
      form.setFieldsValue({
        currency_id: currency.id,
      });
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        setOrderId(res.data.id);
        dispatch(clearOrder());
        form.resetFields();
      })
      .finally(() => setLoading(false));
  }

  const orderCreate = (body, payment_type) => {
    const payment = {
      payment_sys_id: data.paymentType?.value,
    };
    setLoading(true);
    orderService
      .create(body)
      .then((response) => {
        createTransaction(response.data.id, payment);
      })
      .catch(() => setLoading(false));
  };

  const onFinish = (values) => {
    const body = {
      user_id: data.user?.value,
      currency_id: values.currency_id,
      rate: currencies.find((item) => item.id === values.currency_id)?.rate,
      shop_id: data.shop.value,
      coupon: coupon.coupon,
      tax: total.order_tax,
      payment_type: values.payment_type?.label,
      note: values.note,
      products: orderProducts.map((product) => ({
        stock_id: product.stockID.id,
        quantity: product.quantity,
        bonus: product.bonus,
      })),
    };
    orderCreate(body, values.payment_type);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    const nextUrl = 'orders';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    dispatch(fetchOrders());
  };

  return (
    <>
      <PageHeader title={t('new.order')} />
      <Form
        name='order-form'
        form={form}
        layout='vertical'
        onFinish={onFinish}
        className='order-add'
        initialValues={{
          user: data?.user || null,
          currency_id: data?.currency?.id,
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
