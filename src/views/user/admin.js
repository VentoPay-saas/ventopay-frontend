import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  updateUserFilters,
  updateUserParams,
} from 'redux/slices/user';
import formatSortType from 'helpers/formatSortType';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import DeleteButton from 'components/delete-button';
import { Context } from 'context/context';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import ResultModal from 'components/result-modal';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import userService from 'services/user';
import useDemo from 'helpers/useDemo';
import { fetchRoles } from 'redux/slices/role';
import hideEmail from 'components/hideEmail';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';
import UserTabs from './components/tabs';
import UserFilters from './components/filters';

export default function Admin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { users, loading, meta, params, filters } = useSelector(
    (state) => state.user,
    shallowEqual,
  );
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { roles, loading: isRolesLoading } = useSelector(
    (state) => state.role,
    shallowEqual,
  );

  const roleList = useMemo(
    () => [...roles?.map((item) => item?.name), 'deleted_at'],
    [roles],
  );

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [restore, setRestore] = useState(null);

  const { isDemo, demoSeller, demoAdmin, demoModerator, demoMeneger } =
    useDemo();

  const paramsData = {
    sort: filters?.sort,
    column: filters?.column,
    perPage: params?.perPage,
    page: params?.page,
    search: filters?.search?.length ? filters?.search : undefined,
    role: filters?.status !== 'deleted_at' ? filters?.status : undefined,
    deleted_at: filters?.status === 'deleted_at' ? 1 : undefined,
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row.uuid}`,
        id: 'user_edit',
        name: 'User edit',
      }),
    );
    navigate(`/user/${row.uuid}`);
  };

  const goToClone = (row) => {
    dispatch(
      addMenu({
        url: `user-clone/${row.uuid}`,
        id: 'user-clone',
        name: 'user.clone',
      }),
    );
    navigate(`/user-clone/${row.uuid}`);
  };

  const goToDetail = (row) => {
    dispatch(
      addMenu({
        url: `/users/user/${row.uuid}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${row.uuid}`, { state: { user_id: row.id } });
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      sorter: true,
      is_show: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
      is_show: true,
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      is_show: true,
    },
    {
      title: t('email'),
      dataIndex: 'email',
      is_show: true,
      render: (email) => (isDemo ? hideEmail(email || '') : email),
    },
    {
      title: t('role'),
      dataIndex: 'role',
      is_show: true,
    },
    {
      title: t('options'),
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              icon={<ExpandOutlined />}
              onClick={() => setUuid(row?.uuid)}
              disabled={row?.deleted_at}
            />
            {user?.role === 'manager' && row?.role === 'admin' ? undefined : (
              <>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => goToDetail(row)}
                  disabled={row?.deleted_at}
                />
                <Button
                  type='primary'
                  icon={<EditOutlined />}
                  onClick={() => goToEdit(row)}
                  disabled={
                    /*eslint-disable eqeqeq*/
                    (isDemo && row?.id == demoModerator) ||
                    (isDemo && row?.id == demoMeneger) ||
                    (isDemo && row?.id == demoSeller) ||
                    (isDemo && row?.id == demoAdmin) ||
                    row?.deleted_at
                  }
                />
              </>
            )}

            {row?.role !== 'admin' && (
              <Space>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => goToClone(row)}
                  disabled={row?.deleted_at}
                />
                <DeleteButton
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setId([row.id]);
                    setIsModalVisible(true);
                    setText(true);
                  }}
                  disabled={row?.deleted_at}
                />
              </Space>
            )}
          </Space>
        );
      },
    },
  ]);

  const fetch = (params) => {
    batch(() => {
      dispatch(fetchUsers(params));
      dispatch(disableRefetch(params));
    });
  };

  const goToAdduser = (e) => {
    dispatch(
      addMenu({
        id: 'user-add-role',
        url: `user/add/${e}`,
        name: t(`add.${e}`),
      }),
    );
    navigate(`/user/add/${e}`);
  };

  const onChangePagination = (pagination, filter, sorter) => {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    batch(() => {
      dispatch(updateUserFilters({ column, sort }));
      dispatch(updateUserParams({ perPage, page }));
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
        fetch(paramsData);
        setIsModalVisible(false);
        setText([]);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const userDropAll = () => {
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

  const userRestoreAll = () => {
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

  useEffect(() => {
    dispatch(fetchRoles({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchUsers(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useEffect(() => {
    dispatch(fetchUsers(paramsData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.perPage, params?.page, filters]);

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
    <Card
      title={t('users')}
      loading={isRolesLoading}
      extra={
        <Space wrap>
          {filters?.status !== 'deleted_at' ? (
            <Space>
              <DeleteButton onClick={allDelete}>
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
    >
      <UserFilters type='user' />
      <div className='my-4' />
      <UserTabs activeOption={filters?.status} options={roleList} type='user' />
      {filters?.status !== 'admin' &&
        filters?.status !== 'seller' &&
        filters?.status !== 'deleted_at' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type='primary'
              icon={<PlusCircleOutlined />}
              onClick={() => goToAdduser(filters?.status)}
              className='mr-2'
            >
              {t(`add.${filters?.status}`)}
            </Button>
          </div>
        )}
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={users}
        loading={loading}
        pagination={{
          pageSize: params?.perPage ?? 10,
          page: params?.page ?? 1,
          total: meta?.total ?? 0,
          defaultCurrent: 1,
          current: params?.page ?? 1,
        }}
        rowKey={(record) => record.id}
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
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}
      {!!restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? userRestoreAll : userDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setText}
        />
      )}
    </Card>
  );
}
