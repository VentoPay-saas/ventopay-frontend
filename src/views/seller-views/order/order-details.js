import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Table,
  Image,
  Tag,
  Button,
  Space,
  Row,
  Avatar,
  Col,
  Typography,
  Skeleton,
  Steps,
  Spin,
  Badge,
  Modal,
} from 'antd';
import { CalendarOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import orderService from 'services/seller/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import {
  BsCalendarDay,
  BsFillPersonFill,
  BsFillTelephoneFill,
} from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';
import { IMG_URL } from 'configs/app-global';
import { BiMessageDots, BiMoney } from 'react-icons/bi';
import { FiShoppingCart } from 'react-icons/fi';
import { IoMapOutline } from 'react-icons/io5';
import moment from 'moment';
import useDemo from 'helpers/useDemo';
import hideEmail from 'components/hideEmail';
import ColumnImage from 'components/column-image';
import OrderStatusModal from './orderStatusModal';
import UpdateOrderDetailStatus from './updateOrderDetailStatus';

export default function SellerOrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );
  const data = activeMenu?.data?.data;
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const totalPriceRef = useRef();
  const productListRef = useRef();

  const { isDemo } = useDemo();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isOrderDetailsStatus, setIsOrderDetailsStatus] = useState(null);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
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
      render: (_, row) => (
        <Space direction='vertical' className='relative'>
          {row.stock?.product?.translation?.title}
          {row.stock?.extras?.map((extra) => (
            <Tag key={extra.id}>{extra?.value}</Tag>
          ))}
          {row.addons?.map((addon) => (
            <Tag key={addon.id}>
              {addon.stock?.product?.translation?.title} x {addon.quantity}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <ColumnImage image={stock?.product?.img} id={stock?.id} />
      ),
    },
    {
      title: t('kitchen'),
      dataIndex: 'kitchen',
      key: 'kitchen',
      render: (kitchen) => kitchen?.translation?.title || t('N/A'),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status, row) => (
        <Space>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'ended' ? (
            <Tag color='red'>{t(status)}</Tag>
          ) : status === 'cooking' ? (
            <Tag color='yellow'>{t(status)}</Tag>
          ) : (
            <Tag color='green'>{t(status)}</Tag>
          )}
          <EditOutlined onClick={() => setIsOrderDetailsStatus(row)} />
        </Space>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'origin_price',
      key: 'origin_price',
      render: (origin_price) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(
            origin_price,
            defaultCurrency?.symbol,
            defaultCurrency?.symbol,
          )}
        </p>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, row) => (
        <p style={{ width: 'max-content' }}>
          {`${(row?.quantity ?? 1) * (row?.stock?.product?.interval ?? 1)} 
          ${row?.stock?.product?.unit?.translation?.title || ''}`}
        </p>
      ),
    },
    {
      title: t('discount'),
      dataIndex: 'discount',
      key: 'discount',
      render: (discount = 0, row) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(
            (discount ?? 0) / (row?.quantity ?? 1),
            defaultCurrency?.symbol,
            defaultCurrency?.symbol,
          )}
        </p>
      ),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax, row) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(
            (tax ?? 0) / (row?.quantity ?? 1),
            defaultCurrency?.symbol,
            defaultCurrency?.symbol,
          )}
        </p>
      ),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price, row) => {
        const totalPrice =
          (total_price ?? 0) +
          row?.addons?.reduce(
            (total, item) => (total += item?.total_price ?? 0),
            0,
          );

        return (
          <p style={{ width: 'max-content' }}>
            {numberToPrice(
              totalPrice,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
          </p>
        );
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || t('N/A'),
    },
  ];

  const documentColumns = [
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      render: (_, row) =>
        row?.date ? moment(row?.date).format('YYYY-MM-DD HH:mm') : t('N/A'),
    },
    {
      title: t('document'),
      dataIndex: 'document',
      key: 'document',
    },
    {
      title: t('number'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: t('total.price'),
      dataIndex: 'price',
      key: 'price',
    },
  ];

  const documents = [
    {
      price: numberToPrice(
        data?.total_price,
        defaultCurrency.symbol,
        defaultCurrency?.symbol,
      ),
      number: (
        <Link to={`/seller/generate-invoice/${data?.id}`}>#{data?.id}</Link>
      ),
      document: t('invoice'),
      date: moment(data?.transaction?.created_at).format('YYYY-MM-DD HH:mm'),
    },
    {
      price: '-',
      number: (
        <Link to={`/seller/generate-invoice/${data?.id}`}>#{data?.id}</Link>
      ),
      document: t('delivery.reciept'),
      date: moment(data?.transaction?.created_at).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const handleCloseModal = () => {
    setOrderDetails(null);
  };

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then(({ data }) => {
        const currency = data?.currency;
        const user = data?.user;
        const id = data?.id;
        const price = data?.price;
        const createdAt = data?.created_at;
        const details = data?.details.map((item) => ({
          ...item,
          title: item?.shop?.translation?.title,
        }));
        dispatch(
          setMenuData({
            activeMenu,
            data: { details, currency, user, id, createdAt, price, data },
          }),
        );
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    const data = {
      shop_id: myShop.id,
    };
    if (activeMenu.refetch) {
      fetchOrder();
      dispatch(fetchRestOrderStatus({}));
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  return (
    <div className='order_details'>
      <Card
        className='order-details-info'
        title={
          <>
            <FiShoppingCart className='mr-2 icon' />
            {`${t('order')} ${data?.id ? `#${data?.id} ` : ''}`}{' '}
            {t('from.order')} {data?.user?.firstname}{' '}
            {data?.user?.lastname || ''}
          </>
        }
        extra={
          data?.status !== 'delivered' &&
          data?.status !== 'canceled' && (
            <Space>
              {data?.status !== 'delivered' && data?.status !== 'canceled' && (
                <Button type='primary' onClick={() => setOrderDetails(data)}>
                  {t('change.status')}
                </Button>
              )}
            </Space>
          )
        }
      />

      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <Space className='justify-content-between w-100'>
              <Space className='align-items-start'>
                <CalendarOutlined className='order-card-icon' />
                <div className='d-flex flex-column'>
                  <Typography.Text>{t('delivery.date')}</Typography.Text>
                  {loading ? (
                    <Skeleton.Button size={16} />
                  ) : (
                    <Typography.Text className='order-card-title'>
                      {data?.delivery_date} {data?.delivery_time}
                    </Typography.Text>
                  )}
                </div>
              </Space>
              <Space
                className='align-items-start'
                onClick={() =>
                  totalPriceRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <BiMoney className='order-card-icon' />

                <div className='d-flex flex-column'>
                  <Typography.Text>{t('total.price')}</Typography.Text>
                  {loading ? (
                    <Skeleton.Button size={16} loading={loading} />
                  ) : (
                    <Typography.Text className='order-card-title'>
                      {numberToPrice(
                        data?.total_price,
                        defaultCurrency?.symbol,
                        defaultCurrency?.symbol,
                      )}
                    </Typography.Text>
                  )}
                </div>
              </Space>
              <Space className='align-items-start'>
                <BiMessageDots className='order-card-icon' />
                <div className='d-flex flex-column'>
                  <Typography.Text>{t('messages')}</Typography.Text>
                  {loading ? (
                    <Skeleton.Button size={16} />
                  ) : (
                    <Typography.Text className='order-card-title'>
                      {data?.review ? 1 : 0}
                    </Typography.Text>
                  )}
                </div>
              </Space>
              <Space
                className='align-items-start'
                onClick={() =>
                  productListRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <FiShoppingCart className='order-card-icon' />
                <div className='d-flex flex-column'>
                  <Typography.Text>{t('products')}</Typography.Text>
                  {loading ? (
                    <Skeleton.Button size={16} />
                  ) : (
                    <Typography.Text className='order-card-title'>
                      {data?.details?.reduce(
                        (total, item) => (total += item.quantity),
                        0,
                      )}
                    </Typography.Text>
                  )}
                </div>
              </Space>
            </Space>
          </Card>
        </Col>
        {data?.status !== 'canceled' && (
          <Col span={24}>
            <Card>
              <Steps
                current={activeStatusList?.findIndex(
                  (item) => item.name === data?.status,
                )}
              >
                {activeStatusList?.slice(0, -1)?.map((item) => (
                  <Steps.Step key={item?.id} title={t(item?.name)} />
                ))}
              </Steps>
            </Card>
          </Col>
        )}
        <Col span={16}>
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
                  <br />
                  <div>
                    {t('note')}:
                    <span className='ml-2'>
                      {!!data?.note ? data?.note : 'N/A'}
                    </span>
                  </div>
                  <br />
                  {!!data?.table && (
                    <div>
                      {t('table')}:
                      <span className='ml-2'>
                        {data?.table?.name || t('N/A')}
                      </span>
                    </div>
                  )}
                  {data?.delivery_type !== 'dine_in' && (
                    <>
                      <div>
                        {t('payment.status')}:
                        <span className='ml-2'>
                          {t(data?.transaction?.status || 'N/A')}
                        </span>
                      </div>
                    </>
                  )}
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
                  <br />
                  <div>
                    {t('delivery.type')}:
                    <span className='ml-2'>
                      {data?.delivery_type || t('N/A')}
                    </span>
                  </div>
                  {data?.delivery_type !== 'dine_in' && (
                    <>
                      <br />
                      <div>
                        {t('payment.type')}:
                        <span className='ml-2'>
                          {t(data?.transaction?.payment_system?.tag || 'N/A')}
                        </span>
                      </div>
                    </>
                  )}
                </Col>
              </Row>
            </Card>
          </Spin>
          {!!data?.image_after_delivered && (
            <Card title={t('order.image')}>
              <div
                style={{ width: '200px', height: '200px', overflow: 'hidden' }}
              >
                <Image
                  src={data?.image_after_delivered}
                  style={{ objectFit: 'contain' }}
                  height='200px'
                />
              </div>
            </Card>
          )}
          {data?.delivery_type !== 'dine_in' && (
            <Card title={t('documents')}>
              <Table
                columns={documentColumns}
                dataSource={documents}
                pagination={false}
                loading={loading}
              />
            </Card>
          )}
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
                <span>{t('order.tax')}:</span>
                <br />
                <span>{t('product')}:</span>
                <br />
                <span>{t('discount')}:</span>
                <br />
                {/*{data?.coupon_price && (*/}
                {/*  <>*/}
                {/*    <span>{t('coupon')}:</span>*/}
                {/*    <br />*/}
                {/*  </>*/}
                {/*)}*/}
                <span>{t('service.fee')}:</span>
                <br />
                <span>{t('tips')}:</span>
                <br />
                <h3>{t('total.price')}:</h3>
              </div>
              <div>
                <span>
                  {numberToPrice(
                    data?.tax,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </span>
                <br />
                <span>
                  {numberToPrice(
                    data?.origin_price,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </span>
                <br />
                <span>
                  {numberToPrice(
                    data?.total_discount,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </span>
                <br />
                {/*{data?.coupon_price && (*/}
                {/*  <>*/}
                {/*    <span>*/}
                {/*      {numberToPrice(*/}
                {/*        data?.coupon_price,*/}
                {/*        defaultCurrency?.symbol,*/}
                {/*        defaultCurrency?.symbol,*/}
                {/*      )}*/}
                {/*    </span>*/}
                {/*    <br />*/}
                {/*  </>*/}
                {/*)}*/}
                <span>
                  {numberToPrice(
                    data?.service_fee,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </span>
                <br />
                <span>
                  {numberToPrice(
                    data?.tips,
                    defaultCurrency?.symbol,
                    defaultCurrency?.position,
                  )}
                </span>
                <br />
                <h3 ref={totalPriceRef}>
                  {numberToPrice(
                    data?.total_price,
                    defaultCurrency?.symbol,
                    defaultCurrency?.symbol,
                  )}
                </h3>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={8} className='order_info'>
          {data?.delivery_type !== 'dine_in' && (
            <>
              {!!data?.username && (
                <Card title={t('order.receiver')}>
                  <div className='customer-info'>
                    <span className='title'>{t('name')}</span>
                    <span className='description'>
                      <BsFillPersonFill />
                      {data?.username}
                    </span>
                  </div>
                  <div className='customer-info'>
                    <span className='title'>{t('phone')}</span>
                    <span className='description'>
                      <BsFillTelephoneFill />
                      {data?.phone}
                    </span>
                  </div>
                </Card>
              )}

              {!!data?.user && (
                <Card>
                  <div className='d-flex w-100 customer-info-container'>
                    {loading ? (
                      <Skeleton.Avatar size={64} shape='square' />
                    ) : (
                      <Avatar shape='square' size={64} src={data?.user?.img} />
                    )}

                    <h5 className='customer-name'>
                      {loading ? (
                        <Skeleton.Button size={20} style={{ width: 70 }} />
                      ) : (
                        data?.user?.firstname +
                        ' ' +
                        (data?.user?.lastname || '')
                      )}
                    </h5>

                    <div className='customer-info-detail'>
                      <div className='customer-info'>
                        <span className='title'>{t('phone')}</span>
                        <span className='description'>
                          <BsFillTelephoneFill />
                          {loading ? (
                            <Skeleton.Button size={16} />
                          ) : (
                            data?.user?.phone || 'none'
                          )}
                        </span>
                      </div>

                      <div className='customer-info'>
                        <span className='title'>{t('email')}</span>
                        <span className='description'>
                          <MdEmail />
                          {loading ? (
                            <Skeleton.Button size={16} />
                          ) : isDemo ? (
                            hideEmail(data?.user?.email)
                          ) : (
                            data?.user?.email
                          )}
                        </span>
                      </div>
                      <div className='customer-info'>
                        <span className='title'>{t('registration.date')}</span>
                        <span className='description'>
                          <BsCalendarDay />
                          {loading ? (
                            <Skeleton.Button size={16} />
                          ) : (
                            moment(data?.user?.created_at).format(
                              'DD-MM-YYYY, hh:mm',
                            )
                          )}
                        </span>
                      </div>
                      <div className='customer-info'>
                        <span className='title'>{t('orders.count')}</span>
                        <span className='description'>
                          {loading ? (
                            <Skeleton.Button size={16} />
                          ) : (
                            <Badge
                              showZero
                              style={{ backgroundColor: '#3d7de3' }}
                              count={data?.user?.orders_count || 0}
                            />
                          )}
                        </span>
                      </div>
                      <div className='customer-info'>
                        <span className='title'>
                          {t('spent.since.registration')}
                        </span>
                        <span className='description'>
                          {loading ? (
                            <Skeleton.Button size={16} />
                          ) : (
                            <Badge
                              showZero
                              style={{ backgroundColor: '#48e33d' }}
                              count={numberToPrice(
                                data?.user?.orders_sum_price,
                                defaultCurrency?.symbol,
                                defaultCurrency?.symbol,
                              )}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {data?.review && !loading && (
                <Card title={t('messages')}>
                  <div className='order-message'>
                    <span className='message'>{data?.review?.comment}</span>
                    <Space className='w-100 justify-content-end'>
                      <span className='date'>
                        {moment(data?.review?.created_at).format(
                          'YYYY-MM-DD HH:mm',
                        )}
                      </span>
                    </Space>
                  </div>
                </Card>
              )}
            </>
          )}
          <Card title={t('store.information')}>
            {loading ? (
              <Skeleton avatar shape='square' paragraph={{ rows: 2 }} />
            ) : (
              <Space className='w-100'>
                <Avatar
                  shape='square'
                  size={64}
                  src={IMG_URL + data?.shop?.logo_img}
                />
                <div>
                  <h5>{data?.shop?.translation?.title}</h5>
                  {data?.shop?.phone && (
                    <div className='delivery-info'>
                      <b>
                        <BsFillTelephoneFill />
                      </b>
                      <span>{data?.shop?.phone}</span>
                    </div>
                  )}

                  <div className='delivery-info my-1'>
                    <strong>{t('min.delivery.price')}:</strong>
                    <span>
                      {numberToPrice(
                        data?.shop?.price,
                        defaultCurrency?.symbol,
                        defaultCurrency?.symbol,
                      )}
                    </span>
                  </div>
                  <div className='delivery-info'>
                    <b>
                      <IoMapOutline size={16} />
                    </b>
                    <span>{data?.shop?.translation?.address}</span>
                  </div>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
      {orderDetails && (
        <OrderStatusModal
          orderDetails={orderDetails}
          handleCancel={handleCloseModal}
          status={activeStatusList}
        />
      )}
      {!!isOrderDetailsStatus && (
        <Modal
          visible={!!isOrderDetailsStatus}
          footer={false}
          onCancel={() => {
            setIsOrderDetailsStatus(null);
          }}
        >
          <UpdateOrderDetailStatus
            orderDetailId={isOrderDetailsStatus?.id}
            status={isOrderDetailsStatus?.status}
            handleCancel={() => {
              setIsOrderDetailsStatus(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
