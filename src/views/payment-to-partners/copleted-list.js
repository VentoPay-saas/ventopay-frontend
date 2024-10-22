import React, { useEffect, useState } from 'react';
import { Space, Table, Card, DatePicker } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';

import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import numberToPrice from '../../helpers/numberToPrice';
import { DebounceSelect } from '../../components/search';
import userService from '../../services/user';

import moment from 'moment';
import shopService from '../../services/restaurant';
import { fetchPaymentToPartnersCompletedList } from 'redux/slices/paymentToPartners';
const { RangePicker } = DatePicker;

export default function PaymentToPartnersCompleteList() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `order/details/${id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/order/details/${id}`);
  };

  const columns = [
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order_id',
      key: 'order_id',
      sorter: true,
      render: (id) => (
        <span className='text-hover' onClick={() => goToShow(id)}>
          #{id}
        </span>
      ),
    },
    {
      title: t(type),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (_, row) => {
        const user = row?.user;
        return (
          <div>
            {user?.firstname} {user?.lastname || ''}
          </div>
        );
      },
    },
    {
      title: t('order.total_price'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction, row) => {
        const status = transaction?.status;
        return (
          <span>
            {numberToPrice(row?.order?.total_price, defaultCurrency.symbol)}
          </span>
        );
      },
    },
    ...(type === 'seller'
      ? [
          {
            title: t('coupon.price'),
            is_show: true,
            dataIndex: 'coupon_sum_price',
            key: 'coupon_sum_price',
            render: (_, row) => numberToPrice(row?.order?.coupon_sum_price),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('total.cashback'),
            is_show: true,
            dataIndex: 'point_history_sum_price',
            key: 'point_history_sum_price',
            render: (_, row) =>
              numberToPrice(row?.order?.point_history_sum_price),
          },
        ]
      : []),
    {
      title: t('delivery.fee'),
      is_show: true,
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      render: (_, row) => numberToPrice(row?.order?.delivery_fee),
    },
    ...(type === 'seller'
      ? [
          {
            title: t('service.fee'),
            is_show: true,
            dataIndex: 'service_fee',
            key: 'service_fee',
            render: (_, row) =>
              numberToPrice(
                (row?.order?.service_fee || 0) +
                  (row?.order.commission_fee || 0)
              ),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('seller.fee'),
            is_show: true,
            dataIndex: 'seller_fee',
            key: 'seller_fee',
            render: (_, row) => numberToPrice(row?.order?.seller_fee),
          },
        ]
      : []),
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag) || '-',
    },
  ];

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [dateRange, setDateRange] = useState(
    moment().subtract(1, 'month'),
    moment()
  );
  const { completedList, loading, params, meta } = useSelector(
    (state) => state.paymentToPartners,
    shallowEqual
  );
  const data = activeMenu.data;
  const paramsData = {
    search: data?.search,
    sort: data?.sort,
    column: data?.column,
    perPage: data?.perPage,
    page: data?.page,
    user_id: data?.user_id,
    shop_id:
      activeMenu.data?.shop_id !== null ? activeMenu.data?.shop_id : null,
    date_from: Array.isArray(dateRange)
      ? dateRange[0]?.format('YYYY-MM-DD')
      : moment().subtract(1, 'month').format('YYYY-MM-DD'),
    date_to: Array.isArray(dateRange)
      ? dateRange[1]?.format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD'),
    type,
  };

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, perPage, page, column, sort },
      })
    );
  }

  useDidUpdate(() => {
    dispatch(fetchPaymentToPartnersCompletedList(paramsData));
  }, [data, dateRange, type]);

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...{ [name]: item } },
      })
    );
  };

  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
      role: type,
    };
    return userService.search(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    });
  }

  async function fetchShops(search) {
    const params = { search, status: 'approved' };
    return shopService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  useEffect(() => {
    if (activeMenu?.refetch) {
      dispatch(fetchPaymentToPartnersCompletedList(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu?.refetch]);

  useEffect(() => {
    return () => {
      dispatch(setMenuData({ activeMenu, data: {} }));
    };
  }, []);

  return (
    <>
      <Card>
        <div className='flex justify-content-space-between'>
          <Space
            wrap
            className='order-filter'
            style={{ flex: 1, width: '100%' }}
          >
            <DebounceSelect
              placeholder={t('select.shop')}
              fetchOptions={fetchShops}
              style={{ width: '100%' }}
              onSelect={(shop) => handleFilter(shop.value, 'shop_id')}
              onDeselect={() => handleFilter(null, 'shop_id')}
              allowClear={true}
              value={data?.shop_id}
            />
            <DebounceSelect
              placeholder={t('select.user')}
              fetchOptions={getUsers}
              onSelect={(user) => handleFilter(user.value, 'user_id')}
              onDeselect={() => handleFilter(null, 'user_id')}
              style={{ width: '100%' }}
              value={data?.user_id}
            />
            <RangePicker
              value={dateRange}
              onChange={(values) => {
                handleFilter((prev) => ({
                  ...prev,
                  ...{
                    date_from: values?.[0]?.format('YYYY-MM-DD'),
                    date_to: values?.[1]?.format('YYYY-MM-DD'),
                  },
                }));
                setDateRange(values);
              }}
              disabledDate={(current) => {
                return current && current > moment().endOf('day');
              }}
              style={{ width: '100%' }}
            />
          </Space>
        </div>
      </Card>

      <Card>
        <Table
          scroll={{ x: true }}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={completedList}
          loading={loading}
          pagination={{
            pageSize: params.perPage,
            page: activeMenu.data?.page || 1,
            total: meta?.total,
            defaultCurrent: activeMenu.data?.page,
            current: activeMenu.data?.page,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
        />
      </Card>
    </>
  );
}
