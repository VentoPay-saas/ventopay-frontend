import cart from './slices/cart';
import formLang from './slices/formLang';
import menu from './slices/menu';
import order from './slices/order';
import category from './slices/category';
import brand from './slices/brand';
import banner from './slices/banner';
import product from './slices/product';
import restourant from './slices/restourant';
import unit from './slices/unit';
import orders from './slices/orders';
import currency from './slices/currency';
import discount from './slices/discount';
import blog from './slices/blog';
import notification from './slices/notification';
import user from './slices/user';
import extraGroup from './slices/extraGroup';
import extraValue from './slices/extraValue';
import payment from './slices/payment';
import invite from './slices/invite';
import faq from './slices/faq';
import client from './slices/client';
import transaction from './slices/transaction';
import allShops from './slices/allShops';
import auth from './slices/auth';
import backup from './slices/backup';
import productReview from './slices/productReview';
import orderReview from './slices/orderReview';
import globalSettings from './slices/globalSettings';
import chat from './slices/chat';
import statisticsCount from './slices/statistics/count';
import statisticsSum from './slices/statistics/sum';
import topCustomers from './slices/statistics/topCustomers';
import topProducts from './slices/statistics/topProducts';
import orderCounts from './slices/statistics/orderCounts';
import orderSales from './slices/statistics/orderSales';
import myShop from './slices/myShop';
import theme from './slices/theme';
import point from './slices/point';
import role from './slices/role';
import languages from './slices/languages';
import orderStatus from './slices/orderStatus';
import shop from './slices/shop';
import bonus from './slices/product-bonus';
import shopBonus from './slices/shop-bonus';
import subscriber from './slices/subscriber';
import messageSubscriber from './slices/messegeSubscriber';
import emailProvider from './slices/emailProvider';
import workingDays from './slices/shopWorkingDays';
import closeDates from './slices/shopClosedDays';
import productReport from './slices/report/products';
import categoryReport from './slices/report/categories';
import orderReport from './slices/report/order';
import stockReport from './slices/report/stock';
import revenueReport from './slices/report/revenue';
import overviewReport from './slices/report/overview';
import extrasReport from './slices/report/extras';
import branch from './slices/branch';
import addons from './slices/addons';
import shopTag from './slices/shopTag';
import sellerOrders from './slices/sellerOrders';
import bonusList from './slices/bonus-list';
import coupons from './slices/coupons';
import todo from './slices/todo';
import paymentPayload from './slices/paymentPayload';
import sms from './slices/sms-geteways';
import box from './slices/box';
import menuCategory from './slices/menuCategory';
import careerCategory from './slices/career-category';
import career from './slices/career';
import pages from './slices/pages';
import waiterOrder from './slices/waiterOrder';
import bookingZone from './slices/booking-zone';
import bookingTable from './slices/booking-tables';
import bookingTime from './slices/booking-time';
import booking from './slices/booking';
import bookingList from './slices/booking-list';
import landingPage from './slices/landing-page';
import advert from './slices/advert';
import shopAds from './slices/shop-ads';
import requestModels from './slices/request-models';
import paymentToPartners from './slices/paymentToPartners';
import shopReviews from './slices/shop-reviews';
import subscription from './slices/subscription';
import kitchen from './slices/kitchen';

const rootReducer = {
  subscription,
  bookingList,
  booking,
  bookingTime,
  bookingZone,
  bookingTable,
  waiterOrder,
  pages,
  career,
  careerCategory,
  menuCategory,
  sms,
  coupons,
  bonusList,
  sellerOrders,
  shopTag,
  addons,
  branch,
  closeDates,
  workingDays,
  emailProvider,
  messageSubscriber,
  subscriber,
  bonus,
  shopBonus,
  shop,
  orderStatus,
  languages,
  cart,
  menu,
  formLang,
  order,
  category,
  brand,
  banner,
  product,
  restourant,
  unit,
  orders,
  currency,
  discount,
  blog,
  notification,
  user,
  extraGroup,
  extraValue,
  payment,
  invite,
  faq,
  client,
  transaction,
  allShops,
  auth,
  backup,
  productReview,
  orderReview,
  globalSettings,
  chat,
  statisticsCount,
  statisticsSum,
  topProducts,
  topCustomers,
  orderCounts,
  orderSales,
  myShop,
  theme,
  point,
  role,
  productReport,
  categoryReport,
  orderReport,
  stockReport,
  revenueReport,
  overviewReport,
  extrasReport,
  todo,
  paymentPayload,
  box,
  landingPage,
  advert,
  shopAds,
  requestModels,
  paymentToPartners,
  shopReviews,
  kitchen,
};

export default rootReducer;
