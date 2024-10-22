import React, { useEffect, useState } from 'react';
import { Card, Col, Pagination, Row, Spin } from 'antd';
import Meta from 'antd/es/card/Meta';
import { PlusOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from 'helpers/getImage';
import { fetchSellerProducts } from 'redux/slices/product';
import { disableRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getCartData } from 'redux/selectors/cartSelector';
import { BsFillGiftFill } from 'react-icons/bs';
import RiveResult from 'components/rive-result';
import { useLocation } from 'react-router-dom';
import ProductModal from './product-modal';

export default function ProductCard() {
  const { t } = useTranslation();
  const colLg = {
    lg: 8,
    xl: 6,
    xxl: 6,
  };
  const [extrasModal, setExtrasModal] = useState(null);
  const dispatch = useDispatch();
  const { products, loading, meta, params } = useSelector(
    (state) => state.product,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currency } = useSelector((state) => state.cart, shallowEqual);
  const currentData = useSelector((state) => getCartData(state.cart));
  const { before_order_phone_required } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );
  const locat = useLocation();
  const delivery_type = locat?.state?.delivery_type;

  function onChangePagination(page = 1) {
    dispatch(
      fetchSellerProducts({
        perPage: 12,
        page,
        status: 'published',
        active: 1,
      }),
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(
        fetchSellerProducts({
          perPage: 12,
          currency_id: currency?.id,
          status: 'published',
          active: 1,
        }),
      );
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const addProductToCart = (item) => {
    if (!currency && !delivery_type) {
      toast.warning(t('please.select.currency'));
      return;
    }
    if (currentData?.user?.length === 0 && !delivery_type) {
      toast.warning(t('please.select.user'));
      return;
    }
    if (!currentData?.phone && before_order_phone_required === '1') {
      toast.warning(t('please.enter.phone'));
      return;
    }
    if (Number(currentData?.phone) < 0) {
      toast.warning(t('invalid.phone.number'));
      return;
    }
    if (!currentData?.paymentType && !delivery_type) {
      toast.warning(t('please.select.payment.type'));
      return;
    }
    setExtrasModal(item);
  };

  return (
    <div className='px-2'>
      {loading ? (
        <Spin className='d-flex justify-content-center my-5' />
      ) : (
        <Row gutter={12} className='mt-4 product-card'>
          {products.length === 0 ? (
            <Col span={24}>
              <RiveResult id='nosell' />
            </Col>
          ) : (
            products.map((item, index) => (
              <Col {...colLg} key={index}>
                <Card
                  className='products-col'
                  key={item.id}
                  cover={<img alt={item.name} src={getImage(item.img)} />}
                  onClick={() => addProductToCart(item)}
                >
                  <Meta title={item.name} description={item.stock?.price} />

                  <div className='preview'>
                    <PlusOutlined />
                  </div>
                  {item.stocks.map((it) => (
                    <span className={it.bonus ? 'show-bonus' : 'd-none'}>
                      <BsFillGiftFill /> {it.bonus?.value}
                      {'+'}
                      {it.bonus?.bonus_quantity}
                    </span>
                  ))}
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
      {extrasModal && (
        <ProductModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}
      <div className='d-flex justify-content-end my-5'>
        <Pagination
          total={meta.total}
          current={params.page}
          pageSize={12}
          showSizeChanger={false}
          onChange={onChangePagination}
          active={1}
        />
      </div>
    </div>
  );
}
