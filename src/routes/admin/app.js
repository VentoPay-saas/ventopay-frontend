// ** React Imports
import { lazy } from 'react';

const AppRoutes = [
  {
    path: 'dashboard',
    component: lazy(() => import('views/dashboard')),
  },
  {
    path: 'catalog/menu/categories',
    component: lazy(() => import('views/menu-categories')),
  },
  {
    path: 'settings/bookingUpload',
    component: lazy(() => import('views/booking-file-upload')),
  },
  {
    path: 'pos-system',
    component: lazy(() => import('views/pos-system')),
  },
  {
    path: 'cashback',
    component: lazy(() => import('views/cashback')),
  },
  {
    path: 'email/subscriber',
    component: lazy(() => import('views/email-subscribers')),
  },
  {
    path: 'subscriber',
    component: lazy(() => import('views/subscriber')),
  },
  {
    path: 'chat',
    component: lazy(() => import('views/chat')),
  },
  {
    path: 'transactions',
    component: lazy(() => import('views/transactions')),
  },
  {
    path: 'catalog',
    component: lazy(() => import('views/catalog')),
  },
  {
    path: 'bonus/list',
    component: lazy(() => import('views/bonus')),
  },
];

export default AppRoutes;
