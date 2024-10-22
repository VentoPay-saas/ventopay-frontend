import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Space, Spin, Table, Tag } from 'antd';
import orderService from 'services/order';
import { PrinterOutlined } from '@ant-design/icons';
import moment from 'moment';
import numberToPrice from 'helpers/numberToPrice';
import { useTranslation } from 'react-i18next';
import 'assets/scss/components/print.scss';
import { GetColorName } from 'hex-color-to-color-name';
import ColumnImage from 'components/column-image';

const PreviewInfo = ({ orderId, handleClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [list, setList] = useState([]);

  const fetchOrderDetails = () => {
    setLoading(true);
    orderService
      .getById(orderId)
      .then((res) => {
        setData(res.data);
        const items = res.data.details.map((item) => ({
          ...item,
          ...item?.stock?.extras,
        }));
        setList(items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('product.name'),
      dataIndex: 'product',
      key: 'product',
      is_show: true,
      render: (_, row) => (
        <Space wrap>
          {row.stock?.product?.translation?.title}
          {!!row?.bonus && <Tag color='red'>{t('bonus')}</Tag>}
          {row?.addons?.map((addon) => (
            <Tag key={addon.id}>
              {`${addon?.stock?.product?.translation?.title} x ${addon?.quantity ?? 0}`}
            </Tag>
          ))}
          {row.stock?.extras?.map((extra) =>
            extra.group?.type === 'color' ? (
              <Tag key={extra?.id}>
                {extra.group?.translation?.title}: {GetColorName(extra?.value)}
              </Tag>
            ) : (
              <Tag key={extra?.id}>
                {extra.group?.translation?.title}: {extra?.value}
              </Tag>
            ),
          )}
        </Space>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'stock',
      key: 'stock',
      is_show: true,
      render: (stock, row) => (
        <ColumnImage image={stock?.product?.img} id={row?.id} />
      ),
    },
    {
      title: t('price'),
      dataIndex: 'stock',
      key: 'stock',
      is_show: true,
      render: (stock) => (
        <div style={{ width: 'max-content' }}>
          {numberToPrice(stock?.price - (stock?.tax ?? 0))}
        </div>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'stock',
      key: 'stock',
      is_show: true,
      render: (stock, row) => (
        <div style={{ width: 'max-content' }}>
          {stock?.product?.unit?.position === 'before' && (
            <span>{stock?.product?.unit?.translation?.title || ''} </span>
          )}
          {row?.quantity ?? 0}
          {stock?.product?.unit?.position === 'after' && (
            <span> {stock?.product?.unit?.translation?.title || ''}</span>
          )}
        </div>
      ),
    },
    {
      title: t('discount'),
      dataIndex: 'rate_discount',
      key: 'rate_discount',
      is_show: true,
      render: (_, row) => numberToPrice(row?.stock?.discount),
    },
    {
      title: t('tax'),
      dataIndex: 'stock',
      key: 'stock',
      is_show: true,
      render: (stock) => (
        <div style={{ width: 'max-content' }}>{numberToPrice(stock?.tax)}</div>
      ),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      is_show: true,
      render: (total_price, row) => (
        <div style={{ width: 'max-content' }}>
          {numberToPrice(
            (total_price ?? 0) +
              row?.addons?.reduce(
                (acc, cur) => (acc += cur?.total_price ?? 0),
                0,
              ),
          )}
        </div>
      ),
    },
  ];
  return (
    <Modal
      visible={!!orderId}
      title={`Order created successfully`}
      onOk={handleClose}
      onCancel={handleClose}
      footer={[
        <Button onClick={handleClose}>{t('back')}</Button>,
        <Button type='primary' onClick={() => window.print()}>
          <PrinterOutlined type='printer' />
          <span className='ml-1'>{t('print')}</span>
        </Button>,
      ]}
      style={{ minWidth: '80vw' }}
    >
      <div className='py-4'>
        {loading ? (
          <div className='w-100 text-center'>
            <Spin />
          </div>
        ) : (
          <Card
            title={`${t('order.details')} ${data?.id ? `#${data?.id}` : ''}`}
            className='order-details'
          >
            <div className='d-flex justify-content-between mt-3'>
              <div>
                <h2 className='mb-1 font-weight-semibold'>
                  {t('invoice')} #{data?.id}
                </h2>
                <p>{moment(data?.created_at).format('YYYY-MM-DD')}</p>
                <address>
                  <p>
                    {!!data?.table && (
                      <>
                        <br />
                        <span>
                          {t('table')}: {t(data?.table?.name || 'N/A')}
                        </span>
                      </>
                    )}
                    {!!data?.address?.address && (
                      <>
                        <br />
                        <span>
                          {t('delivery.address')}:{' '}
                          {data?.address?.address || 'N/A'}
                        </span>
                      </>
                    )}
                    {!!data?.delivery_date_time && (
                      <>
                        <br />
                        <span>
                          {`${t('delivery.date')}: ${moment(data?.delivery_date_time).format('YYYY-MM-DD HH:mm')}`}
                        </span>
                      </>
                    )}
                    {data?.note && (
                      <>
                        <br />
                        <span>
                          {t('note')}: {data?.note || t('N/A')}
                        </span>
                      </>
                    )}
                  </p>
                </address>
              </div>
              <address>
                <p>
                  <span className='font-weight-semibold text-dark font-size-md'>
                    {data?.user?.firstname} {data?.user?.lastname || ''}
                  </span>
                  {data?.phone && (
                    <>
                      <br />
                      <span>
                        {t('phone')}: {data?.phone || t('N/A')}
                      </span>
                    </>
                  )}
                  <br />
                  <span>
                    {t('email')}: {data?.user?.email || t('N/A')}
                  </span>
                </p>
              </address>
            </div>

            <div className='mt-4'>
              <Table
                scroll={{ x: true }}
                dataSource={list}
                pagination={false}
                className='mb-5'
                columns={columns?.filter((item) => item?.is_show)}
              />
              <div className='d-flex justify-content-end'>
                <div className='text-right '>
                  <div className='border-bottom'>
                    <p className='mb-2'>
                      {`${t('sub.total')}: ${numberToPrice(
                        data?.origin_price,
                        data?.currency?.symbol,
                        data?.currency?.position,
                      )}`}
                    </p>
                    {/*<p>*/}
                    {/*  {`${t('delivery.price')}: ${numberToPrice(*/}
                    {/*    data?.delivery_fee,*/}
                    {/*    data?.currency?.symbol,*/}
                    {/*    data?.currency?.position,*/}
                    {/*  )}`}*/}
                    {/*</p>*/}
                    <p>
                      {`${t('shop.tax')}: ${numberToPrice(
                        data?.tax,
                        data?.currency?.symbol,
                        data?.currency?.position,
                      )}`}
                    </p>
                    <p>
                      {`${t('service.fee')}: ${numberToPrice(
                        data?.service_fee,
                        data?.currency?.symbol,
                        data?.currency?.position,
                      )}`}
                    </p>
                    {/*{!!data?.coupon_price && (*/}
                    {/*  <p>*/}
                    {/*    {`${t('coupon')}: - ${numberToPrice(*/}
                    {/*      data?.coupon_price,*/}
                    {/*      data?.currency?.symbol,*/}
                    {/*      data?.currency?.position,*/}
                    {/*    )}`}*/}
                    {/*  </p>*/}
                    {/*)}*/}
                    {!!data?.total_discount && (
                      <p>
                        {`${t('discount')}: - ${numberToPrice(
                          data?.total_discount,
                          data?.currency?.symbol,
                          data?.currency?.position,
                        )}`}
                      </p>
                    )}
                  </div>
                  <h2 className='font-weight-semibold mt-3'>
                    <span className='mr-1'>{t('grand.total')}: </span>
                    {numberToPrice(
                      data?.total_price,
                      data?.currency?.symbol,
                      data?.currency?.position,
                    )}
                  </h2>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default PreviewInfo;
