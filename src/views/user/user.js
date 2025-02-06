import React, { useEffect, useState, useContext } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaTrashRestoreAlt, FaUserCog } from 'react-icons/fa';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from 'helpers/formatSortType';
import useDidUpdate from 'helpers/useDidUpdate';
import {
  fetchClients,
  updateClientFilters,
  updateClientParams,
} from 'redux/slices/client';
import FilterColumns from 'components/filter-column';
import DeleteButton from 'components/delete-button';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import ResultModal from 'components/result-modal';
import userService from 'services/user';
import useDemo from 'helpers/useDemo';
import hideEmail from 'components/hideEmail';
import UserFilters from './components/filters';
import UserTabs from './components/tabs';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';

const User = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta, params, filters, statuses } = useSelector(
    (state) => state.client,
    shallowEqual,
  );
  const { isDemo } = useDemo();

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [restore, setRestore] = useState(null);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      is_show: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
      key: 'firstname',
      is_show: true,
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      key: 'lastname',
      is_show: true,
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      is_show: true,
      render: (email) => (isDemo ? hideEmail(email || '') : email),
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      is_show: true,
    },
    {
      title: t('options'),
      dataIndex: 'options',
      key: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              disabled={row?.deleted_at}
              icon={<EyeOutlined />}
              onClick={() => goToDetail(row)}
            />
            <Button
              icon={<ExpandOutlined />}
              onClick={() => setUuid(row?.uuid)}
              disabled={row?.deleted_at}
            />
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={row?.deleted_at}
            />
            <Tooltip title={t('change.user.role')}>
              <Button
                disabled={row?.deleted_at}
                onClick={() => setUserRole(row)}
                icon={<FaUserCog />}
              />
            </Tooltip>
            <DeleteButton
              disabled={row?.deleted_at}
              icon={<DeleteOutlined />}
              onClick={() => {
                setId([row?.id]);
                setIsModalVisible(true);
                setText(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const paramsData = {
    ...params,
    sort: filters?.sort,
    column: filters?.column,
    search: filters?.search?.length ? filters?.search : undefined,
    status: filters?.status !== 'deleted_at' ? filters?.status : undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
  };

  const fetch = (params = {}) => {
    dispatch(fetchClients(params));
    dispatch(disableRefetch(activeMenu));
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row._id}`,
        id: 'user_edit',
        name: 'User edit',
      }),
    );
    navigate(`/user/${row._id}`, { state: 'user' });
  };

  const goToDetail = (row) => {
    dispatch(
      addMenu({
        url: `users/user/${row._id}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${row._id}`, { state: { user_id: row._id } });
  };

  const goToAddClient = () => {
    dispatch(
      addMenu({
        id: 'user-add',
        url: 'user/add',
        name: t('add.client'),
      }),
    );
    navigate('/user/add');
  };

  const onChangePagination = (pagination, filter, sorter) => {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    batch(() => {
      dispatch(updateClientFilters({ column, sort }));
      dispatch(updateClientParams({ perPage, page }));
    });
  };

  const userDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    userService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchClients(paramsData));
        setIsModalVisible(false);
        setText([]);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const clientDropAll = () => {
    setLoadingBtn(true);
    userService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        fetch(paramsData);
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const clientRestoreAll = () => {
    setLoadingBtn(true);
    userService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        fetch(paramsData);
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch(paramsData);
    }
  }, [activeMenu.refetch]);

  useEffect(() => {
    fetch(paramsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, params?.perPage, params?.page]);

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  return (
    <>
      <Card
        title={t('clients')}
        extra={
          <Space wrap>
            {filters?.status !== 'deleted_at' ? (
              <Space>
                <Button
                  type='primary'
                  icon={<PlusCircleOutlined />}
                  onClick={goToAddClient}
                >
                  {t('add.client')}
                </Button>
                <DeleteButton size='' onClick={allDelete}>
                  {t('delete.selected')}
                </DeleteButton>
                <DeleteButton onClick={() => setRestore({ delete: true })}>
                  {t('delete.all')}
                </DeleteButton>
              </Space>
            ) : (
              <DeleteButton
                icon={<FaTrashRestoreAlt className='mr-2' />}
                onClick={() => setRestore({ restore: true })}
              >
                {t('restore.all')}
              </DeleteButton>
            )}
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        }
      />
      <Card>
        <UserFilters type='client' />
        <div className='my-4' />
        <UserTabs
          options={statuses}
          activeOption={filters?.status}
          type='client'
        />
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={clients}
          loading={loading}
          pagination={{
            pageSize: paramsData?.perPage ?? 10,
            page: paramsData?.page ?? 1,
            total: meta?.total ?? 0,
            defaultCurrent: 1,
            current: paramsData?.page,
          }}
          rowKey={(record) => record?.id}
          onChange={onChangePagination}
        />
        <CustomModal
          click={userDelete}
          text={text ? t('delete') : t('all.delete')}
          loading={loadingBtn}
          setText={setId}
        />
        {!!uuid && (
          <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />
        )}
        {!!userRole && (
          <UserRoleModal
            data={userRole}
            handleCancel={() => setUserRole(null)}
          />
        )}

        {!!restore && (
          <ResultModal
            open={restore}
            handleCancel={() => setRestore(null)}
            click={restore.restore ? clientRestoreAll : clientDropAll}
            text={
              restore.restore ? t('restore.modal.text') : t('read.carefully')
            }
            subTitle={restore.restore ? '' : t('confirm.deletion')}
            loading={loadingBtn}
            setText={setText}
          />
        )}
      </Card>
    </>
  );
};

export default User;
