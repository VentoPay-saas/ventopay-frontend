// ** React Imports
import { lazy } from 'react';

const SubscriptionsRoutes = [
  {
    path: 'subscriptions',
    component: lazy(() => import('views/subscriptions/subscriptions')),
  },
  {
    path: 'subscriptions/edit',
    component: lazy(() => import('views/subscriptions/subscriptions-edit')),
  },
  {
    path: 'subscription/options',
    component: lazy(() => import('views/subscriptions/options')),
  },
  {
    path: 'subscription/options/add',
    component: lazy(() => import('views/subscriptions/options/add')),
  },
  {
    path: 'subscription/options/:id',
    component: lazy(() => import('views/subscriptions/options/edit')),
  },
];

export default SubscriptionsRoutes;
