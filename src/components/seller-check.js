import { Button, Card, Divider, Space, Table, Tag } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from 'services/seller/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import numberToPrice from 'helpers/numberToPrice';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import useDidUpdate from 'helpers/useDidUpdate';
import { useQueryParams } from 'helpers/useQueryParams';
import { disableRefetch } from 'redux/slices/menu';
import Loading from './loading';

const calculateProductPrice = (row) => {
  return (
    ((row?.origin_price ?? 0) +
      row?.addons?.reduce((acc, cur) => (acc += cur?.origin_price ?? 0), 0)) /
    (row?.quantity ?? 1)
  );
};

const calculateProductTotalPrice = (row) => {
  return (
    (row?.total_price ?? 0) +
    row?.addons?.reduce((acc, cur) => (acc += cur?.origin_price ?? 0), 0)
  );
};

const SellerCheck = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const componentRef = useRef();
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const dispatch = useDispatch();

  const { settings } = useSelector((state) => state.globalSettings);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => stock?.id,
    },
    {
      title: t('product'),
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, row) => (
        <Space wrap>
          <span>
            {stock?.product?.translation?.title ||
              stock?.product?.id ||
              t('N/A')}
          </span>
          <span>
            {stock?.extras?.map((extra) => (
              <Tag key={extra?.id}>{extra?.value}</Tag>
            ))}
          </span>
          {row?.addons?.map((addon) => (
            <Tag key={addon?.id}>
              {`${addon?.stock?.product?.translation?.title} x ${addon?.quantity ?? 1}`}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'origin_price',
      key: 'origin_price',
      render: (_, row) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(calculateProductPrice(row), defaultCurrency?.symbol)}
        </p>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, row) => (
        <p
          style={{ width: 'max-content' }}
        >{`${quantity} ${row?.stock?.product?.unit?.translation?.title}`}</p>
      ),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(tax, defaultCurrency?.symbol)}
        </p>
      ),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (_, row) => (
        <p style={{ width: 'max-content' }}>
          {numberToPrice(
            calculateProductTotalPrice(row),
            defaultCurrency?.symbol,
          )}
        </p>
      ),
    },
  ];

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    if (!loading && queryParams.get('print') === 'true') {
      handlePrint();
    }
  }, [id, queryParams]);

  function fetchOrder() {
    if (!id) return;
    setLoading(true);
    orderService
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      if (queryParams.get('print') === 'true') {
        queryParams.set('print', false);
      }
    },
  });

  return (
    <Card
      title={t('invoice')}
      extra={
        <Space wrap>
          <Button type='primary' onClick={() => navigate(-1)}>
            <span className='ml-1'>{t('back')}</span>
          </Button>
          <Button type='primary' onClick={() => handlePrint()}>
            <PrinterOutlined type='printer' />
            <span className='ml-1'>{t('print')}</span>
          </Button>
        </Space>
      }
    >
      {loading ? (
        <Loading />
      ) : (
        <div className='container_check' ref={componentRef}>
          <header className='check_header'>
            <span>
              <img
                src={settings?.favicon}
                alt='img'
                className='check_icon overflow-hidden w-25 h-25 rounded'
              />
              <h1>Invoice</h1>
            </span>
            <span className='check_companyInfo'>
              <h1>{settings?.title}</h1>
              <h5>{settings?.address}</h5>
            </span>
          </header>
          <main>
            <span>
              <h4>
                {t('order.id')}: {data?.id}
              </h4>
              {!!data?.created_at && (
                <p>{`${t('created.at')}: ${moment(data?.created_at).format('YYYY-MM-DD')}`}</p>
              )}
              <address>
                <p>
                  <span>
                    {t('delivery.type')}: {data?.delivery_type || t('N/A')}
                  </span>
                  <br />
                  {!!data?.address?.address && (
                    <>
                      <span>
                        {t('delivery.address')}: {data?.address?.address}
                      </span>
                      <br />
                    </>
                  )}
                  {!!data?.delivery_date_time && (
                    <>
                      <span>
                        {`${t('delivery.date')}: ${data?.delivery_date || ''}
                        ${data?.delivery_time || ''}`}
                      </span>
                      <br />
                    </>
                  )}
                  <span>
                    {t('delivery.fee')}: {numberToPrice(data?.delivery_fee)}
                  </span>
                  <br />
                  <span>
                    {t('tax')}: {numberToPrice(data?.tax)}
                  </span>
                  <br />
                  <span>
                    {t('status')}: <Tag color='green'>{data?.status}</Tag>
                  </span>
                </p>
              </address>
            </span>
            <span>
              <h3 className='shop_data'>
                {t('shop.id')}: #{data?.shop?.id}
              </h3>
              <span>
                {t('title')}: {data?.shop?.translation?.title}
              </span>
              <br />
              <span>
                {t('address')}: {data?.shop?.translation?.address || t('N/A')}
              </span>
              <br />
              <span>
                {t('phone')}: {data?.shop?.phone}
              </span>
            </span>
          </main>
          <Table
            scroll={{ x: true }}
            columns={columns}
            dataSource={data?.details || []}
            loading={loading}
            rowKey={(record) => record.id}
            pagination={false}
            className='check_table'
            bordered
          />
          <footer>
            <span />
            <span>
              <span>{t('origin.price')}</span>
              <h3 style={{ marginBottom: '10px' }}>
                {numberToPrice(data?.origin_price, defaultCurrency?.symbol)}
              </h3>
              {data?.delivery_fee && (
                <>
                  <span>{t('delivery.fee')}</span>
                  <h3 style={{ marginBottom: '10px' }}>
                    {numberToPrice(data?.delivery_fee, defaultCurrency?.symbol)}
                  </h3>
                </>
              )}
              {data?.service_fee && (
                <>
                  <span>{t('service.fee')}</span>
                  <h3 style={{ marginBottom: '10px' }}>
                    {numberToPrice(data?.service_fee, defaultCurrency?.symbol)}
                  </h3>
                </>
              )}
              {data?.tax && (
                <>
                  <span>{t('tax')}</span>
                  <h3 style={{ marginBottom: '10px' }}>
                    {numberToPrice(data?.tax, defaultCurrency?.symbol)}
                  </h3>
                </>
              )}
              {!!data?.tips && (
                <>
                  <span>{t('tips')}</span>
                  <h3 style={{ marginBottom: '10px' }}>
                    {numberToPrice(data?.tips, defaultCurrency?.symbol)}
                  </h3>
                </>
              )}
              {/*{!!data?.coupon_price && (*/}
              {/*  <>*/}
              {/*    <span>{t('coupon')}</span>*/}
              {/*    <h3 style={{ marginBottom: '10px' }}>*/}
              {/*      {numberToPrice(data?.coupon_price, defaultCurrency?.symbol)}*/}
              {/*    </h3>*/}
              {/*  </>*/}
              {/*)}*/}
              {data?.total_discount && (
                <>
                  <span>{t('total.discount')}</span>
                  <h3 style={{ marginBottom: '10px' }}>
                    {numberToPrice(
                      data?.total_discount,
                      defaultCurrency?.symbol,
                    )}
                  </h3>
                </>
              )}
              <Divider />
              <span>{t('total.price')}</span>
              <h1>
                {numberToPrice(data?.total_price, defaultCurrency?.symbol)}
              </h1>
            </span>
          </footer>
          <section className='text-center'>
            © {moment(new Date()).format('YYYY')} {settings?.title}.{' '}
            {t('all.rights.reserved')}
          </section>
        </div>
      )}
    </Card>
  );
};

export default SellerCheck;
