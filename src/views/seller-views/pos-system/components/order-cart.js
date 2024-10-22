import React, { useState } from 'react';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Image, Row, Space, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  clearCart,
  removeFromCart,
  reduceCart,
  setCartShops,
  clearCartShops,
  setCartTotal,
  removeBag,
  clearData,
} from 'redux/slices/cart';
import getImage from 'helpers/getImage';
import useDidUpdate from 'helpers/useDidUpdate';
import orderService from 'services/seller/order';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { getCartData, getCartItems } from 'redux/selectors/cartSelector';
import { toast } from 'react-toastify';
import { fetchSellerProducts } from 'redux/slices/product';
import transactionService from 'services/transaction';
import QueryString from 'qs';
import { useLocation } from 'react-router-dom';
import PreviewInfo from './preview-info';
// import Coupon from './coupon';

export default function OrderCart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const locat = useLocation();

  const { cartItems, cartShops, currentBag, total, currency } = useSelector(
    (state) => state.cart,
    shallowEqual,
  );
  const filteredCartItems = useSelector((state) => getCartItems(state.cart));
  const data = useSelector((state) => getCartData(state.cart), shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const delivery_type = locat?.state?.delivery_type;

  const deleteCard = (e) => {
    dispatch(removeFromCart(e));
  };

  const clearAll = () => {
    batch(() => {
      dispatch(clearCart());
      dispatch(clearData());
      if (currentBag !== 0) {
        dispatch(removeBag(currentBag));
      }
    });
  };

  const increment = (item) => {
    if (item.quantity === item?.stock?.quantity) {
      return;
    }
    if (item.quantity === item.max_qty) {
      return;
    }
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const decrement = (item) => {
    if (item.quantity === 1) {
      return;
    }
    if (item.quantity <= item.min_qty) {
      return;
    }
    dispatch(reduceCart({ ...item, quantity: 1 }));
  };

  function formatProducts(list) {
    const products = list.map((item) => ({
      quantity: item.quantity,
      stock_id: item.stockID ? item.stockID?.id : item.stock?.id,
      addons: item?.addons?.map((addon) => ({
        stock_id: addon?.stockID,
        quantity: addon?.quantity,
      })),
    }));

    const result = {
      products,
      currency_id: currency?.id,
      // coupon:
      //   coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      //     ?.coupon || undefined,
      shop_id: shop.id,
      type: delivery_type
        ? delivery_type
        : data?.deliveries?.label?.toLowerCase(),
      address: {
        latitude: data?.address?.lat,
        longitude: data?.address?.lng,
      },
    };
    return QueryString.stringify(result, { addQueryPrefix: true });
  }

  useDidUpdate(() => {
    if (filteredCartItems.length) {
      productCalculate();
    } else {
      dispatch(clearCartShops());
    }
  }, [
    cartItems,
    currentBag,
    // coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
    //   ?.recalculate,
  ]);

  console.log('filteredCartItems', filteredCartItems);

  function productCalculate() {
    const products = formatProducts(filteredCartItems);

    setLoading(true);
    orderService
      .calculate(products)
      .then(({ data }) => {
        const product = data.data;
        const items = product.stocks.map((item) => ({
          ...filteredCartItems.find((el) => el.id === item.id),
          ...item,
          ...item.stock.countable,
          stock: item.stock.stock_extras,
          stocks: item.stock.stock_extras,
          stockID: item.stock,
        }));
        dispatch(setCartShops(items));
        const orderData = {
          product_total: product?.stocks?.reduce(
            (acc, curr) => acc + (curr?.total_price ?? curr?.price ?? 0),
            0,
          ),
          product_tax: product.total_tax,
          shop_tax: product.total_shop_tax,
          order_total: product.total_price,
          delivery_fee: product.delivery_fee,
          service_fee: product?.service_fee,
          discount: product?.total_discount,
          // couponPrice: product?.coupon_price ?? 0,
        };
        dispatch(setCartTotal(orderData));
      })
      .finally(() => setLoading(false));
  }

  const handleSave = (id) => {
    setOrderId(id);
    dispatch(
      fetchSellerProducts({
        perPage: 12,
        currency_id: currency?.id,
        status: 'published',
        active: 1,
      }),
    );
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    clearAll();
    toast.success(t('successfully.closed'));
  };

  const handleClick = () => {
    if (!currency) {
      toast.warning(t('please.select.currency'));
      return;
    }
    setLoading(true);
    const products = cartShops?.map((cart) => ({
      stock_id: cart.stockID.id,
      quantity: cart.countable_quantity,
      bonus: cart.bonus,
      addons: cart?.addons?.map((addon) => ({
        stock_id: addon.id,
        quantity: addon.quantity,
      })),
    }));
    const defaultBody = {
      user_id: data.user?.value,
      currency_id: currency?.id,
      rate: currency?.rate,
      shop_id: shop.id,
      // coupon:
      //   coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      //     ?.coupon || undefined,
      tax: total.order_tax,
      products: products,
      phone: data?.phone?.toString(),
    };

    const dineInBody = {
      currency_id: currency?.id,
      delivery_type: delivery_type,
      payment_type: data.paymentType?.label,
      products: products,
      shop_id: shop.id,
    };

    const body = delivery_type ? dineInBody : defaultBody;

    const payment = {
      payment_sys_id: data.paymentType.value,
    };

    orderService
      .create(body)
      .then((response) => {
        createTransaction(response.data.id, payment);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        handleSave(res.data.id);
        form.resetFields();
      })
      .finally(() => setLoading(false));
  }

  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div className='card-save'>
        {cartShops.map((item) => (
          <div>
            {item.bonus !== true ? (
              <div className='custom-cart-container' key={item.id}>
                <Row className='product-row'>
                  <Image
                    width={70}
                    height='auto'
                    src={getImage(item.img)}
                    preview
                    placeholder
                    className='rounded'
                  />
                  <Col span={18} className='product-col'>
                    <div>
                      <span className='product-name'>
                        {item?.translation?.title}
                      </span>
                      <br />
                      <Space wrap className='mt-2'>
                        {item?.stock?.map((el) => {
                          return (
                            <span className='extras-text rounded pr-2 pl-2'>
                              {el.value}
                            </span>
                          );
                        })}
                      </Space>
                      <br />
                      <Space wrap className='mt-2'>
                        {item?.addons?.map((addon) => {
                          return (
                            <span className='extras-text rounded pr-2 pl-2'>
                              {addon?.product?.translation?.title} x{' '}
                              {addon.quantity}
                            </span>
                          );
                        })}
                      </Space>
                      <div className='product-counter'>
                        <span>
                          <span>
                            {numberToPrice(
                              item?.total_price || item?.price,
                              currency?.symbol,
                            )}
                          </span>
                        </span>

                        <div className='count'>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<MinusOutlined size={14} />}
                            onClick={() => decrement(item)}
                          />
                          <span>
                            {item.countable_quantity * (item?.interval || 1)}
                            {item?.unit?.translation?.title}
                          </span>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<PlusOutlined size={14} />}
                            onClick={() => increment(item)}
                          />
                          <Button
                            className='button-counter'
                            shape='circle'
                            onClick={() => deleteCard(item)}
                            icon={<DeleteOutlined size={14} />}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <>
                <h4 className='mt-2'>{t('bonus.product')}</h4>
                <div className='custom-cart-container' key={item.id}>
                  <Row className='product-row'>
                    <Image
                      width={70}
                      height='auto'
                      src={getImage(item.img)}
                      preview
                      placeholder
                      className='rounded'
                    />
                    <Col span={18} className='product-col'>
                      <div>
                        <span className='product-name'>
                          {item?.stockID?.product?.translation?.title}
                        </span>
                        <br />
                        <Space wrap className='mt-2'>
                          {item?.stock?.map((el) => {
                            return (
                              <span className='extras-text rounded pr-2 pl-2'>
                                {el.value}
                              </span>
                            );
                          })}
                        </Space>
                        <br />
                        <Space wrap className='mt-2'>
                          {item.addons?.map((addon) => {
                            return (
                              <span className='extras-text rounded pr-2 pl-2'>
                                {addon?.product?.translation?.title} x{' '}
                                {addon.quantity}
                              </span>
                            );
                          })}
                        </Space>
                        <div className='product-counter'>
                          <span>
                            {numberToPrice(
                              item?.total_price || item?.price,
                              currency?.symbol,
                            )}
                          </span>

                          <div className='count'>
                            <Button
                              className='button-counter'
                              shape='circle'
                              icon={<MinusOutlined size={14} />}
                              onClick={() => decrement(item)}
                              disabled
                            />
                            <span>
                              {(item?.quantity ?? 0) * (item?.interval ?? 1)}
                              {item?.stockID?.product?.unit?.translation
                                ?.title || ''}
                            </span>
                            <Button
                              className='button-counter'
                              shape='circle'
                              icon={<PlusOutlined size={14} />}
                              onClick={() => increment(item)}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        ))}
        {/*<Coupon coupons={coupons} currentBag={currentBag} />*/}

        <Row className='all-price-row'>
          <Col span={24} className='col'>
            <div className='all-price-container'>
              <span>{t('sub.total')}</span>
              <span>
                {numberToPrice(total.product_total, currency?.symbol)}
              </span>
            </div>
            <div className='all-price-container'>
              <span>{t('product.tax')}</span>
              <span>{numberToPrice(total.product_tax, currency?.symbol)}</span>
            </div>
            <div className='all-price-container'>
              <span>{t('shop.tax')}</span>
              <span>{numberToPrice(total.shop_tax, currency?.symbol)}</span>
            </div>
            {/*<div className='all-price-container'>*/}
            {/*  <span>{t('delivery.fee')}</span>*/}
            {/*  <span>{numberToPrice(total.delivery_fee, currency?.symbol)}</span>*/}
            {/*</div>*/}
            {/*<div className='all-price-container'>*/}
            {/*  <span>{t('coupon')}</span>*/}
            {/*  <span>{numberToPrice(total?.couponPrice, currency?.symbol)}</span>*/}
            {/*</div>*/}
            {/*{!!total?.couponPrice && (*/}
            {/*  <div className='all-price-container'>*/}
            {/*    <span>{t('coupon')}</span>*/}
            {/*    <span style={{ color: 'red' }}>*/}
            {/*      - {numberToPrice(total?.couponPrice, currency?.symbol)}*/}
            {/*    </span>*/}
            {/*  </div>*/}
            {/*)}*/}
            {!!total?.discount && (
              <div className='all-price-container'>
                <span>{t('discount')}</span>
                <span style={{ color: 'red' }}>
                  - {numberToPrice(total?.discount, currency?.symbol)}
                </span>
              </div>
            )}
          </Col>
        </Row>

        <Row className='submit-row'>
          <Col span={14} className='col'>
            <span>{t('total.amount')}</span>
            <span>{numberToPrice(total.order_total, currency?.symbol)}</span>
          </Col>
          <Col className='col2'>
            <Button
              type='primary'
              onClick={() => handleClick()}
              disabled={!cartShops.length}
            >
              {t('place.order')}
            </Button>
          </Col>
        </Row>
      </div>
      {!!orderId && (
        <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
      )}
    </Card>
  );
}
