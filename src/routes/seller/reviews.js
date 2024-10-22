// ** React Imports
import { lazy } from 'react';

const ReviewRoutes = [
  {
    path: 'seller/reviews',
    component: lazy(() => import('views/seller-views/reviews')),
  },
  {
    path: 'seller/reviews/product',
    component: lazy(() => import('views/seller-views/reviews/productReviews')),
  },
  {
    path: 'seller/reviews/order',
    component: lazy(() => import('views/seller-views/reviews/orderReviews')),
  },
];

export default ReviewRoutes;
