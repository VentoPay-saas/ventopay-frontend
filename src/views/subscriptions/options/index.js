import React, { useContext, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table } from 'antd';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import formatSortType from 'helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import { fetchSubscription } from 'redux/slices/subscription';
import subscriptionService from 'services/subscriptions';

export default function Subscription() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `subscription/options/${row.id}`,
        id: 'subscription_edit',
        name: t('edit.subscription'),
      })
    );
    navigate(`/subscription/options/${row.id}`);
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => translation?.title,
    },
    {
      title: t('limit'),
      dataIndex: 'limit',
      key: 'limit',
      is_show: true,
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button
              loading={loadingBtn}
              icon={<DeleteOutlined />}
              onClick={() => {
                notificationDelete([row.id]);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { subscription, meta, loading, params } = useSelector(
    (state) => state.subscription,
    shallowEqual
  );

  const notificationDelete = (id) => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        }))
      ),
    };
    subscriptionService
      .deleteOption(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchSubscription());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSubscription());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchSubscription(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.subscription',
        url: `subscription/options/add`,
        name: t('add.subscription'),
      })
    );
    navigate(`/subscription/options/add`);
  };

  return (
    <Card
      title={t('subscription')}
      extra={
        <Space>
          <Button
            icon={<PlusCircleOutlined />}
            type='primary'
            onClick={goToAdd}
          >
            {t('add.subscription')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: true }}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={subscription || []}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
    </Card>
  );
}
