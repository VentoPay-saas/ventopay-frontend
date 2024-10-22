// ** React Imports
import { lazy } from 'react';

const WaiterAppRoutes = [
  {
    path: 'my-shop',
    component: lazy(() => import('views/waiter-views/order')),
  },
  {
    path: 'waiter/pos-system',
    component: lazy(() => import('views//waiter-views/pos-system')),
  },
];

export default WaiterAppRoutes;
