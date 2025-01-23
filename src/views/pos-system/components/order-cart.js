import React, { useEffect, useState } from 'react';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Space,
  Spin,
} from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  clearCart,
  removeFromCart,
  setCartShops,
  clearCartShops,
  setCartTotal,
  removeBag,
  setCartOrder,
  addOrderNotes,
  clearData,
} from 'redux/slices/cart';
import shopService from 'services/shop';
import getImage from 'helpers/getImage';
import useDidUpdate from 'helpers/useDidUpdate';
import orderService from 'services/order';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { getCartData, getCartItems } from 'redux/selectors/cartSelector';
import PreviewInfo from 'views/order/preview-info';
import { toast } from 'react-toastify';
import { fetchRestProducts } from 'redux/slices/product';
import useDebounce from 'helpers/useDebounce';
import transactionService from 'services/transaction';
import QueryString from 'qs';
// import Coupon from './coupon';

export default function OrderCart() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { cartItems, cartShops, currentBag, total, currency, notes } =
    useSelector((state) => state.cart, shallowEqual);
  const filteredCartItems = useSelector((state) => getCartItems(state.cart));
  const data = useSelector((state) => getCartData(state.cart));

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const debouncedCartItems = useDebounce(cartItems, 300);

  const deleteCard = (e) => {
    dispatch(removeFromCart(e));
  };

  const clearAll = () => {
    batch(() => {
      if (currentBag !== 0) {
        dispatch(removeBag(currentBag));
      } else {
        dispatch(clearCart());
        dispatch(clearData());
      }
    });
  };

  const increment = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const decrement = (item) => {
    dispatch(addToCart({ ...item, quantity: -1 }));
  };

  // function getShops() {
  //   shopService.getById(data?.shop?.value).then((res) => setShops(res.data));
  // }

  // useEffect(() => {
  //   if (data?.shop?.value) {
  //     getShops();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  function getShops() {
    if (!data?.shop?.value) return; // Prevent unnecessary calls
    setLoading(true);
    shopService
      .getById(data.shop.value)
      .then((res) => {
        setShops(res.data);
      })
      .catch((err) => {
        console.error('Error fetching shops:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (data?.shop?.value) {
      getShops();
    }
  }, [data?.shop?.value]);


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
      currency_id: currency?._id,
      // coupon:
      //   coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      //     ?.coupon || undefined,
      shop_id: data?.shop?.value,
      type: data?.deliveries?.label?.toLowerCase(),
      address: {
        latitude: data?.address?.lat,
        longitude: data?.address?.lng,
      },
    };
    return QueryString.stringify(result, { addQueryPrefix: true });
  }

  useDidUpdate(() => {
    dispatch(
      fetchRestProducts({
        perPage: 12,
        currency_id: currency?.id,
        shop_id: data?.shop?.value,
        active: 1,
      }),
    );
    if (filteredCartItems.length) {
      productCalculate();
    }
  }, [currency]);

  useDidUpdate(() => {
    if (filteredCartItems.length) {
      productCalculate();
    } else {
      dispatch(clearCartShops());
    }
  }, [
    debouncedCartItems,
    currentBag,
    data?.address,
    currency,
    // coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
    //   ?.recalculate,
  ]);

  function productCalculate() {
    const products = formatProducts(filteredCartItems);
    setLoading(true);
    orderService
      .calculate(products)
      .then(({ data }) => {
        const product = data.data;
        const items = product.stocks.map((item) => ({
          ...filteredCartItems.find((el) => el._id === item.stock_id),
          ...item,
          ...item.stock?.countable,
          stock: item.stock?.stock_extras,
          stocks: item.stock?.stock_extras,
          stockID: item.stock,
        }));
        let shopList = [{ ...shops, products: items }];
        dispatch(setCartShops(shopList));
        const orderData = {
          product_total: product.stocks?.reduce(
            (acc, curr) => acc + (curr.total_price ?? curr.price ?? 0),
            0,
          ),
          product_tax: product.total_tax,
          shop_tax: product.total_shop_tax,
          order_total: product.total_price,
          delivery_fee: product.delivery_fee,
          service_fee: product?.service_fee,
          // couponOBJ: product?.coupon,
          // couponPrice: product?.coupon_price ?? 0,
          discount: product?.total_discount ?? 0,
        };
        dispatch(setCartTotal(orderData));
        // calculateCashback(product.total_price);
      })
      .finally(() => setLoading(false));
  }

  const handleSave = (id) => {
    setOrderId(id);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    clearAll();
    toast.success(t('successfully.closed'));
  };

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res.data.id))
      .finally(() => setLoading(false));
  }

  const handleClick = () => {
    if (!currency) {
      toast.warning(t('please.select.currency'));
      return;
    }
    setLoading(true);
    const products = cartShops?.[0]?.products?.map((cart) => ({
      stock_id: cart?.stockID?.id,
      quantity: cart?.countable_quantity,
      bonus: cart?.bonus,
      addons: cart?.addons?.map((addon) => ({
        stock_id: addon?.id,
        quantity: addon?.quantity,
      })),
    }));
    const body = {
      user_id: data.user?.value,
      currency_id: currency?.id,
      rate: currency.rate,
      shop_id: data.shop.value,
      // coupon:
      //   coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      //     ?.coupon || undefined,
      tax: total.order_tax,
      payment_type: data.paymentType?.label,
      products: products,
      phone: data?.phone?.toString(),
    };

    const payment = {
      payment_sys_id: data.paymentType.value,
    };

    orderService
      .create(body)
      .then((response) => {
        dispatch(setCartOrder(response.data));
        createTransaction(response.data._id, payment);
        form.resetFields();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div className='card-save'>
        {cartShops?.map((shop, idx) => (
          console.log(shop, "shoooooooooooooooooooooooooooop["),

          <div key={shop._id + '_' + idx}>
            <div className='all-price'>
              <span className='title'>
                {shop?.title} {t('shop')}
              </span>
              <span className='counter'>
                {shop?.products?.length}{' '}
                {shop?.products?.length > 1 ? t('products') : t('product')}
              </span>
            </div>
            <Divider />
            {shop?.products?.map((item, index) =>
              !item?.bonus ? (
                console.log("item", item),

                <div
                  className='custom-cart-container'
                  key={item?.id + '_' + index}
                >
                  <Row className='product-row'>
                    <Image
                      width={70}
                      height='auto'
                      src={getImage(shop?.images[0]?.url)}
                      preview
                      placeholder
                      className='rounded'
                    />
                    <Col span={18} className='product-col'>
                      <div>
                        <span className='product-name'>
                          {item?.title}
                        </span>
                        <br />
                        <Space wrap className='mt-2'>
                          {item?.stock?.map((el, idy) => {
                            return (
                              <span
                                key={idy + '-' + el.value}
                                className='extras-text rounded pr-2 pl-2'
                              >
                                {el.value}
                              </span>
                            );
                          })}
                        </Space>
                        <br />
                        <Space wrap className='mt-2'>
                          {item?.addons?.map((addon, idk) => {
                            return (
                              <span
                                key={idk + '-' + addon?.quantity}
                                className='extras-text rounded pr-2 pl-2'
                              >
                                {addon?.product?.title} x{' '}
                                {addon?.quantity}
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
                            />
                            <span>
                              {item?.countable_quantity * (item?.interval || 1)}
                              {item?.unit_id?.title || ''}
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
                    <Col span={24}>
                      <Input
                        placeholder={t('note')}
                        className='w-100 mt-2'
                        defaultValue={notes[item.stockID?.id]}
                        onBlur={(event) =>
                          dispatch(
                            addOrderNotes({
                              label: item.stockID.id,
                              value: event.target.value || undefined,
                            }),
                          )
                        }
                      />
                    </Col>
                  </Row>
                </div>
              ) : (
                <>
                  <h4 className='mt-2'> {t('Bonus.product')} </h4>
                  <div
                    className='custom-cart-container'
                    key={item.id + '_' + index}
                  >
                    <Row className='product-row'>
                      <Image
                        width={70}
                        height='auto'
                        src={getImage(item?.img)}
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
                            {item?.stock?.map((el, idj) => {
                              return (
                                <span
                                  key={idj + '_' + el?.value}
                                  className='extras-text rounded pr-2 pl-2'
                                >
                                  {el?.value}
                                </span>
                              );
                            })}
                          </Space>
                          <br />
                          <Space wrap className='mt-2'>
                            {item.addons?.map((addon, idp) => {
                              return (
                                <span
                                  key={idp + '_' + addon?.quantity}
                                  className='extras-text rounded pr-2 pl-2'
                                >
                                  {addon?.product?.translation?.title} x{' '}
                                  {addon?.quantity}
                                </span>
                              );
                            })}
                          </Space>
                          <div className='product-counter'>
                            <span>
                              {numberToPrice(
                                item?.total_price ?? item?.price,
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
                                {item?.unit_id?.title}
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
              ),
            )}
            {/*<Coupon*/}
            {/*  coupons={coupons}*/}
            {/*  currentBag={currentBag}*/}
            {/*  shopId={data?.shop?.value}*/}
            {/*/>*/}
          </div>
        ))}

        <Row className='all-price-row'>
          <Col span={24} className='col'>
            <div className='all-price-container'>
              <span>{t('sub.total')}</span>
              <span>
                {numberToPrice(total.product_total, currency?.symbol)}
              </span>
            </div>
            <div className='all-price-container'>
              <span>{t('shop.tax')}</span>
              <span>{numberToPrice(total.shop_tax, currency?.symbol)}</span>
            </div>
            {/*<div className='all-price-container'>*/}
            {/*  <span>{t('delivery.fee')}</span>*/}
            {/*  <span>{numberToPrice(total.delivery_fee, currency?.symbol)}</span>*/}
            {/*</div>*/}
            <div className='all-price-container'>
              <span>{t('service.fee')}</span>
              <span>{numberToPrice(total.service_fee, currency?.symbol)}</span>
            </div>
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
              loading={loading}
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
