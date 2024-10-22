import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Image, Tag, Button, Space, Row, Col, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import orderService from '../../../services/waiter/order';
import getImage from '../../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import OrderStatusModal from './orderStatusModal';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../../helpers/numberToPrice';
import { BsCalendarDay } from 'react-icons/bs';
import { FiShoppingCart } from 'react-icons/fi';
import moment from 'moment';

export default function WaiterOrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const { statusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual
  );
  const data = activeMenu?.data?.data;
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const totalPriceRef = useRef();
  const productListRef = useRef();

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [locationsMap, setLocationsMap] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (_, row) => row.stock?.id,
    },
    {
      title: t('product.name'),
      dataIndex: 'product',
      key: 'product',
      render: (_, row) => row.stock?.product?.translation?.title,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (_, row) => (
        <Image
          src={getImage(row.stock?.product?.img)}
          alt='product'
          width={100}
          height='auto'
          className='rounded'
          preview
          placeholder
        />
      ),
    },
    {
      title: t('price'),
      dataIndex: 'origin_price',
      key: 'origin_price',
      render: (origin_price) =>
        numberToPrice(origin_price, defaultCurrency?.symbol),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('discount'),
      dataIndex: 'discount',
      key: 'discount',
      render: (discount = 0, row) =>
        numberToPrice(discount / row.quantity, defaultCurrency?.symbol),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax, row) =>
        numberToPrice(tax / row.quantity, defaultCurrency?.symbol),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price, row) => {
        const data =
          total_price +
          row?.addons?.reduce((total, item) => (total += item.total_price), 0);

        return numberToPrice(data, defaultCurrency?.symbol);
      },
    },
  ];

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
  };

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then(({ data }) => {
        const currency = data.currency;
        const user = data.user;
        const id = data.id;
        const price = data.price;
        const createdAt = data.created_at;
        const details = data.details.map((item) => ({
          ...item,
          title: item.shop?.translation?.title,
        }));
        dispatch(
          setMenuData({
            activeMenu,
            data: { details, currency, user, id, createdAt, price, data },
          })
        );
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  return (
    <div className='order_details'>
      <Card
        className='order-details-info'
        title={
          <>
            <FiShoppingCart className='mr-2 icon' />
            {`${t('order')} ${data?.id ? `#${data?.id} ` : ''}`}{' '}
            {t('from.order')} {data?.table?.name}
          </>
        }
        extra={
          data?.status !== 'delivered' &&
          data?.status !== 'canceled' &&
          data?.status !== 'accepted' &&
          data?.status !== 'cooking' ? (
            <Button type='primary' onClick={() => setOrderDetails(data)}>
              {t('change.status')}
            </Button>
          ) : null
        }
      />
      <Spin spinning={loading}>
        <Card style={{ minHeight: '200px' }}>
          <Row hidden={loading} className='mb-3 order_detail'>
            <Col span={12}>
              <div>
                {t('created.date.&.time')}:
                <span className='ml-2'>
                  <BsCalendarDay className='mr-1' />{' '}
                  {moment(data?.created_at).format('YYYY-MM-DD HH:mm')}{' '}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div>
                {t('status')}:
                <span className='ml-2'>
                  {data?.status === 'new' ? (
                    <Tag color='blue'>{t(data?.status)}</Tag>
                  ) : data?.status === 'canceled' ? (
                    <Tag color='error'>{t(data?.status)}</Tag>
                  ) : (
                    <Tag color='cyan'>{t(data?.status)}</Tag>
                  )}
                </span>
              </div>
            </Col>{' '}
            <Col span={12}>
              <div>
                {t('table')}:
                <span className='ml-2'>
                  {data?.table?.name || t('unspecified')}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div>
                {t('delivery_type')}:
                <span className='ml-2'>
                  {data?.delivery_type || t('unspecified')}
                </span>
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
      <Card className='w-100 order-table'>
        <Table
          ref={productListRef}
          scroll={{ x: true }}
          columns={columns}
          dataSource={activeMenu.data?.details || []}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={false}
        />
        <Space
          size={100}
          className='d-flex justify-content-end w-100 order-table__summary'
        >
          <div>
            <span>{t('delivery.fee')}:</span>
            <br />
            <span>{t('order.tax')}:</span>
            <br />
            <span>{t('product')}:</span>
            <br />
            <span>{t('discount')}:</span>
            <br />
            <h3>{t('total.price')}:</h3>
          </div>
          <div>
            <span>
              {numberToPrice(data?.delivery_fee, defaultCurrency?.symbol)}
            </span>
            <br />
            <span>{numberToPrice(data?.tax, defaultCurrency?.symbol)}</span>
            <br />
            <span>
              {numberToPrice(data?.origin_price, defaultCurrency?.symbol)}
            </span>
            <br />
            <span>
              {numberToPrice(data?.total_discount, defaultCurrency?.symbol)}
            </span>
            <br />
            <h3 ref={totalPriceRef}>
              {numberToPrice(data?.total_price, defaultCurrency?.symbol)}
            </h3>
          </div>
        </Space>
      </Card>

      {orderDetails && (
        <OrderStatusModal
          orderDetails={orderDetails}
          handleCancel={handleCloseModal}
          status={statusList}
        />
      )}
    </div>
  );
}
