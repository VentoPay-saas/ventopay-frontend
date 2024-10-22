import React, { useEffect, useState, useContext } from 'react';
import { Button, Table, Card, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { fetchShopAds } from 'redux/slices/shop-ads';
import { Context } from '../../context/context';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import FilterColumns from 'components/filter-column';
import { addMenu, disableRefetch, setMenuData } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import DeleteButton from '../../components/delete-button';
import { useNavigate } from 'react-router-dom';
import CustomModal from 'components/modal';
import ShopAdsStatusModal from './shop-ads-status-modal';
import shopAdsService from 'services/shop-ads';
import formatSortType from '../../helpers/formatSortType';
import moment from 'moment';

export default function ShopAds() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    shopAdsList,
    loading: listLoading,
    meta,
  } = useSelector((state) => state.shopAds, shallowEqual);
  const { setIsModalVisible } = useContext(Context);

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shopAdsDetails, setShopAdsDetails] = useState(null);

  const data = activeMenu.data;

  const paramsData = {
    search: data?.serach,
    perPage: data?.perPage,
    page: data?.page,
    sort: data?.sort,
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchShopAds(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchShopAds(paramsData));
  }, [activeMenu.data]);

  const onChangePagination = (pagination, filter, sorter) => {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, perPage, page, column, sort },
      }),
    );
  };

  const shopAdsDelete = () => {
    setLoading(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    shopAdsService
      .delete(params)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchShopAds(paramsData));
        setText(null);
        setActive(false);
      })
      .finally(() => {
        setLoading(false);
        setId(null);
      });
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'shop-ads',
        url: `shop-ads/${row.id}`,
        name: t('edit.shop.ads'),
      }),
    );
    navigate(`/shop-ads/${row.id}`);
  };

  const goToTransactions = () => {
    dispatch(
      addMenu({
        id: 'transactions',
        url: `transactions`,
        name: t('transactions'),
      }),
    );
    navigate(`/transactions`);
  };

  const handleActive = () => {
    setLoading(true);
    shopAdsService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchShopAds(paramsData));
        toast.success(t('successfully.updated'));
        setActive(false);
      })
      .finally(() => setLoading(false));
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      is_show: true,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('shop'),
      dataIndex: 'title',
      is_show: true,
      render: (_, row) => {
        return <span>{row?.shop?.translation?.title}</span>;
      },
    },
    {
      title: t('expire.at'),
      dataIndex: 'expire_at',
      is_show: true,
      render: (_, row) => (
        <>
          {row?.expired_at ? (
            moment(row?.expired_at).format('YYYY-MM-DD HH:mm')
          ) : (
            <span>{t('not.expired')}</span>
          )}
        </>
      ),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {!row.deleted_at ? (
            <EditOutlined onClick={() => setShopAdsDetails(row)} />
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: t('transaction'),
      dataIndex: 'transaction',
      is_show: true,
      render: (transaction, row) => {
        return (
          <>
            {!!transaction ? (
              <Button onClick={goToTransactions} color='cyan'>
                {row?.transaction?.status}
              </Button>
            ) : (
              <Button color='error'>{t('not.paid')}</Button>
            )}
          </>
        );
      },
    },
    {
      title: t('options'),
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={row.deleted_at}
            />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setId([row.id]);
                setText(true);
                setActive(false);
              }}
              disabled={row.deleted_at}
            />
          </Space>
        );
      },
    },
  ]);

  return (
    <>
      <Card className='p-0'>
        <Space wrap size={[14, 20]}>
          <DeleteButton size='' onClick={allDelete}>
            {t('delete.selected')}
          </DeleteButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      </Card>
      <Card>
        <Table
          scroll={{ x: true }}
          dataSource={shopAdsList}
          columns={columns?.filter((item) => item?.is_show)}
          rowSelection={rowSelection}
          rowKey={(record) => record.id}
          loading={loading || listLoading}
          pagination={{
            pageSize: meta.per_page,
            page: meta.current_page,
            total: meta.total,
          }}
          onChange={onChangePagination}
        />
      </Card>
      {shopAdsDetails && (
        <ShopAdsStatusModal
          data={shopAdsDetails}
          handleCancel={() => setShopAdsDetails(null)}
          paramsData={paramsData}
        />
      )}
      <CustomModal
        click={active ? handleActive : shopAdsDelete}
        text={
          active ? t('set.active.advert') : text ? t('delete') : t('all.delete')
        }
        setText={setId}
        setActive={setActive}
      />
    </>
  );
}
