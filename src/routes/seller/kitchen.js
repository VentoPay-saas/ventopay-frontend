import { lazy } from 'react';

const SellerKitchenRoutes = [
  {
    path: 'seller/kitchen',
    component: lazy(() => import('views/seller-views/kitchen')),
  },
  {
    path: 'seller/kitchen/create',
    component: lazy(() => import('views/seller-views/kitchen/create')),
  },
  {
    path: 'seller/kitchen/edit/:id',
    component: lazy(() => import('views/seller-views/kitchen/edit')),
  },
];

export default SellerKitchenRoutes;
