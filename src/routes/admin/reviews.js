// ** React Imports
import { lazy } from 'react';

const ReviewRoutes = [
  {
    path: 'reviews',
    component: lazy(() => import('views/reviews')),
  },
  {
    path: 'reviews/product',
    component: lazy(() => import('views/reviews/productReviews')),
  },
  {
    path: 'reviews/order',
    component: lazy(() => import('views/reviews/orderReviews')),
  },
];

export default ReviewRoutes;
