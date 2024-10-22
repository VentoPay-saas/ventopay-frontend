import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from '../../redux/slices/menu';
import {
  fetchSellerStatisticsCount,
  fetchStatistics,
} from '../../redux/slices/statistics/count';
import {
  fetchSellerTopCustomers,
  fetchTopCustomers,
} from '../../redux/slices/statistics/topCustomers';
import {
  fetchSellerTopProducts,
  fetchTopProducts,
} from '../../redux/slices/statistics/topProducts';
import Loading from '../../components/loading';
import {
  fetchOrderCounts,
  fetchSellerOrderCounts,
} from '../../redux/slices/statistics/orderCounts';
import {
  fetchOrderSales,
  fetchSellerOrderSales,
} from '../../redux/slices/statistics/orderSales';
import GeneralDashboard from './generalDashboard';
import ManagerDashboard from './managerDashboard';
import ModeratorDashboard from './moderatorDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { loading, params } = useSelector(
    (state) => state.statisticsCount,
    shallowEqual
  );

  function getDashboardsByRole() {
    const body = { time: params.type || 'subMonth' };
    const otherChartsBody = { time: 'subWeek' };
    switch (user?.role) {
      case 'admin':
        dispatch(fetchStatistics(body));
        dispatch(fetchTopCustomers(otherChartsBody));
        dispatch(fetchTopProducts(otherChartsBody));
        dispatch(fetchOrderCounts(otherChartsBody));
        dispatch(fetchOrderSales(otherChartsBody));
        break;
      case 'manager':
        dispatch(fetchTopCustomers(otherChartsBody));
        dispatch(fetchTopProducts(otherChartsBody));
        break;
      case 'seller':
        dispatch(fetchSellerStatisticsCount(body));
        dispatch(fetchSellerTopCustomers(otherChartsBody));
        dispatch(fetchSellerTopProducts(otherChartsBody));
        dispatch(fetchSellerOrderCounts(otherChartsBody));
        dispatch(fetchSellerOrderSales(otherChartsBody));
        break;
      case 'moderator':
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (activeMenu.refetch || params.type) {
      getDashboardsByRole();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch, params.type]);

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'admin':
        return <GeneralDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'seller':
        return <GeneralDashboard />;
      case 'moderator':
        return <ModeratorDashboard />;
      case 'waiter':
        return <Navigate to='/waiter/orders-board' replace />;

      default:
        return null;
    }
  };

  return (
    <div className='h-100'>
      {!loading ? renderDashboardByRole() : <Loading size='large' />}
    </div>
  );
}
