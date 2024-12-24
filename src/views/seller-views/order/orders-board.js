import React, { useEffect, useState, useContext } from 'react';
import { Button, Space, Card, DatePicker, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ClearOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { fetchOrders as fetchSellerOrders } from '../../../redux/slices/sellerOrders';
import SearchInput from '../../../components/search-input';
import { DebounceSelect } from '../../../components/search';
import userService from '../../../services/seller/user';
import { fetchRestOrderStatus } from '../../../redux/slices/orderStatus';
import { Context } from '../../../context/context';
import { toast } from 'react-toastify';
import orderService from '../../../services/seller/order';
import Incorporate from './dnd/Incorporate';
import {
  clearItems,
  fetchAcceptedOrders,
  fetchCanceledOrders,
  fetchDeliveredOrders,
  fetchNewOrders,
  fetchOnAWayOrders,
  fetchReadyOrders,
  fetchCookingOrders,
} from '../../../redux/slices/sellerOrders';
import { batch } from 'react-redux';
import OrderTypeSwitcher from './order-type-switcher';
import { clearOrder } from '../../../redux/slices/order';
import DownloadModal from './downloadModal';
import CustomModal from '../../../components/modal';
import TransactionStatusModal from './transactionStatusModal';
import moment from 'moment';
import { handleSearch } from 'redux/slices/orders';
const { RangePicker } = DatePicker;

export default function SellerOrdersBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [id, setId] = useState(null);
  const { setIsModalVisible } = useContext(Context);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [locationsMap, setLocationsMap] = useState(null);
  const [dowloadModal, setDowloadModal] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [type, setType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const urlParams = useParams();
  const orderType = urlParams?.type;

  const data = activeMenu?.data;

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `seller/order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      }),
    );
    navigate(`/seller/order/details/${row.id}`);
  };

  const orderDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    orderService
      .delete(params)
      .then(() => {
        dispatch(clearItems());
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        fetchOrderAllItem({ status: type });
        setText(null);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  useDidUpdate(() => {
    const paramsData = {
      search: data?.search,
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
      user_id: data?.userId,
      status: data?.status,
    };
    dispatch(handleSearch(paramsData));
    dispatch(clearItems());
    fetchOrderAllItem();
  }, [data]);

  useEffect(() => {
    if (activeMenu?.refetch) {
      const params = {
        status: data?.status,
        perPage: 10,
        delivery_type: orderType,
      };
      dispatch(fetchSellerOrders(params));
      dispatch(fetchRestOrderStatus());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu?.refetch]);

  const handleFilter = (item, name) => {
    batch(() => {
      dispatch(clearItems());
      dispatch(
        setMenuData({
          activeMenu,
          data: { ...data, [name]: item },
        }),
      );
    });
  };

  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
    };
    return userService.getAll(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname || ''}`,
        value: item.id,
      }));
    });
  }

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const fetchOrdersCase = (params) => {
    const paramsWithType = {
      ...params,
      search: data?.search ? data.search : undefined,
      user_id: data?.client_id,
      status: params?.status,
      shop_id:
        activeMenu.data?.shop_id !== null ? activeMenu.data?.shop_id : null,
    };
    switch (params.status) {
      case 'new':
        dispatch(fetchNewOrders(paramsWithType));
        break;
      case 'accepted':
        dispatch(fetchAcceptedOrders(paramsWithType));
        break;
      case 'ready':
        dispatch(fetchReadyOrders(paramsWithType));
        break;
      case 'on_a_way':
        dispatch(fetchOnAWayOrders(paramsWithType));
        break;
      case 'delivered':
        dispatch(fetchDeliveredOrders(paramsWithType));
        break;
      case 'canceled':
        dispatch(fetchCanceledOrders(paramsWithType));
        break;
      case 'cooking':
        dispatch(fetchCookingOrders(paramsWithType));
        break;
      default:
        console.log(`Sorry, we are out of`);
    }
  };

  const fetchOrderAllItem = () => {
    dispatch(clearItems());
    fetchOrdersCase({ status: 'new' });
    fetchOrdersCase({ status: 'accepted' });
    fetchOrdersCase({ status: 'ready' });
    fetchOrdersCase({ status: 'on_a_way' });
    fetchOrdersCase({ status: 'delivered' });
    fetchOrdersCase({ status: 'canceled' });
    fetchOrdersCase({ status: 'cooking' });
  };

  const handleClear = () => {
    batch(() => {
      dispatch(clearItems());
      dispatch(
        setMenuData({
          activeMenu,
          data: null,
        }),
      );
    });
    fetchOrderAllItem();
  };

  const handleCloseModal = () => {
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
    setDowloadModal(null);
  };
  const goToAddOrder = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'pos.system',
        url: 'seller/pos-system',
        name: t('add.order'),
      }),
    );
    navigate('/seller/pos-system', { state: { delivery_type: orderType } });
  };

  return (
    <>
      <Space className='justify-content-end w-100 mb-3'>
        <OrderTypeSwitcher listType='seller/orders-board' />
        <Button
          type='primary'
          icon={<PlusCircleOutlined />}
          onClick={goToAddOrder}
          style={{ width: '100%' }}
        >
          {t('add.order')}
        </Button>
      </Space>
      <Card>
        <Space wrap>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
            defaultValue={activeMenu.data?.search}
            resetSearch={!data?.search}
          />
          <DebounceSelect
            placeholder={t('select.client')}
            fetchOptions={getUsers}
            onSelect={(user) => handleFilter(user.value, 'client_id')}
            onDeselect={() => handleFilter(null, 'client_id')}
            style={{ minWidth: 200 }}
            // onClear={() => dispatch(clearItems())}
            value={data?.client_id}
          />
          <RangePicker
            defaultValue={dateRange}
            onChange={(values) => {
              handleFilter(JSON.stringify(values), 'data_time');
              setDateRange(values);
            }}
            disabledDate={(current) => {
              return current && current > moment().endOf('day');
            }}
            allowClear={true}
            style={{ width: '100%' }}
            onClear={() => {
              dispatch(clearItems());
              setDateRange(null);
            }}
          />
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            {t('clear')}
          </Button>
          {/* <DeleteButton size='' onClick={allDelete}>
            {t('delete.selected')}
          </DeleteButton> */}
        </Space>
      </Card>
      <Incorporate
        goToShow={goToShow}
        fetchOrderAllItem={fetchOrderAllItem}
        fetchOrders={fetchOrdersCase}
        setLocationsMap={setLocationsMap}
        setId={setId}
        setIsModalVisible={setIsModalVisible}
        setText={setText}
        setDowloadModal={setDowloadModal}
        type={type}
        setType={setType}
        orderType={orderType}
        setIsTransactionModalOpen={setIsTransactionModalOpen}
      />
      <CustomModal
        click={orderDelete}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
        setActive={setId}
      />
      {dowloadModal && (
        <DownloadModal id={dowloadModal} handleCancel={handleCloseModal} />
      )}
      {!!isTransactionModalOpen && (
        <Modal
          visible={!!isTransactionModalOpen}
          footer={false}
          onCancel={() => setIsTransactionModalOpen(null)}
        >
          <TransactionStatusModal
            orderId={isTransactionModalOpen?.orderId}
            status={isTransactionModalOpen?.status}
            onCancel={() => setIsTransactionModalOpen(null)}
            refreshOrders={fetchOrderAllItem}
          />
        </Modal>
      )}
    </>
  );
}
