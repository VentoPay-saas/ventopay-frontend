import { Button, Card, Space, Switch, Table, Tag } from 'antd';
import DeleteButton from 'components/delete-button';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LOCALE_COLORS } from 'constants/index';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQueryParams } from 'helpers/useQueryParams';
import { fetchSellerKitchens } from 'redux/slices/kitchen';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useContext, useEffect } from 'react';
import useDidUpdate from 'helpers/useDidUpdate';
import RiveResult from 'components/rive-result';
import { toast } from 'react-toastify';
import { Context } from 'context/context';

const KitchenList = ({ id = null, setId = (a) => {} }) => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { kitchens, loading, meta, initialParams } = useSelector(
    (state) => state.kitchen.seller,
    shallowEqual,
  );

  const params = {
    ...initialParams,
    search: queryParams.get('search') || undefined,
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('name'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => translation?.title || t('N/A'),
    },
    {
      title: t('translations'),
      dataIndex: 'translations',
      key: 'translations',
      is_show: true,
      render: (translations) => {
        return (
          <Space>
            {!!translations?.length
              ? translations?.map((item, index) => (
                  <Tag
                    className='text-uppercase'
                    color={[LOCALE_COLORS[index]]}
                    key={`${item?.locale}_${index}`}
                  >
                    {item?.locale}
                  </Tag>
                ))
              : t('N/A')}
          </Space>
        );
      },
    },
    // {
    //   title: t('active'),
    //   dataIndex: 'active',
    //   is_show: true,
    //   render: (active, row) => {
    //     return (
    //       <Switch
    //         // onChange={() => {
    //         //   setChangeActiveProductSlug(row?.slug);
    //         //   setIsModalVisible(true);
    //         // }}
    //         checked={!!active}
    //       />
    //     );
    //   },
    // },
    {
      title: t('options'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
      render: (id) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(id)}
            />
            <DeleteButton onClick={() => handleDelete(id)} />
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    fetch(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch(params);
    }
  }, [activeMenu.refetch]);

  const fetch = (params = {}) => {
    batch(() => {
      dispatch(fetchSellerKitchens(params));
      dispatch(disableRefetch(activeMenu));
    });
  };

  const handleDelete = (selectedShopId) => {
    if (!selectedShopId) {
      toast.warning(t('no.id'));
    } else {
      setId([selectedShopId]);
      setIsModalVisible(true);
    }
  };

  const onChangePagination = (pagination) => {
    const { pageSize, current } = pagination;

    const paramsData = {
      ...params,
      perPage: pageSize,
      page: current,
    };

    fetch(paramsData);
  };

  const goToEdit = (id) => {
    const url = `seller/kitchen/edit/${id}`;
    dispatch(
      addMenu({
        id: 'edit-kitchen',
        url,
        name: t('edit.place'),
      }),
    );
    navigate(`/${url}`);
  };

  return (
    <Card>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        columns={columns.filter((column) => column.is_show)}
        scroll={{ x: true }}
        loading={loading}
        rowKey={(record) => record?.id}
        pagination={{
          defaultCurrent: 1,
          current: meta?.current_page || 1,
          pageSize: meta?.per_page || 10,
          total: meta?.total || 0,
        }}
        dataSource={kitchens}
        rowSelection={{
          selectedRowKeys: id,
          onChange: (selectedRowKeys) => setId(selectedRowKeys),
        }}
        onChange={onChangePagination}
      />
    </Card>
  );
};

export default KitchenList;
