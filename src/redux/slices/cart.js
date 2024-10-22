import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  cartShops: [],
  cartOrder: null,
  cartPayment: null,
  data: [
    {
      user: '',
      userUuid: '',
      address: '',
      paymentType: '',
      bag_id: 0,
      shop: null,
      delivery_fee: 0,
      currentCurrency: null,
      payment_type: null,
      currency_shop: null,
      coupon: null,
      phone: null,
    },
  ],
  total: {},
  bags: [0],
  currentBag: 0,
  coupons: [],
  currency: null,
  notes: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) =>
          item.stockID.id === payload.stockID.id &&
          item?.addons?.length === payload?.addons?.length &&
          payload?.addons?.every((payloadAddon) =>
            item?.addons?.find(
              (itemAddon) =>
                itemAddon?.addon_id ===
                  (payloadAddon?.addon_id ?? payloadAddon?.countable_id) &&
                itemAddon?.quantity === payloadAddon?.quantity,
            ),
          ) &&
          item.bag_id === payload.bag_id,
      );
      if (existingIndex >= 0) {
        const quantity =
          state.cartItems[existingIndex]?.quantity + payload?.quantity;
        if (
          quantity <= state.cartItems[existingIndex]?.max_qty &&
          quantity >= state.cartItems[existingIndex]?.min_qty
        ) {
          state.cartItems[existingIndex].quantity = quantity;
        }
      } else {
        state.cartItems.push(payload);
      }
    },
    reduceCart(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.stockID.id === action.payload.stockID.id,
      );

      if (state.cartItems[itemIndex].quantity > 1) {
        state.cartItems[itemIndex].quantity -= 1;
      }
    },
    removeFromCart(state, action) {
      const { payload } = action;
      const filteredCartItems = state.cartItems.filter(
        (item) =>
          !(
            item.stockID.id === payload.stockID.id &&
            item?.addons?.length === payload?.addons?.length &&
            payload?.addons?.every((payloadAddon) =>
              item?.addons?.find(
                (itemAddon) =>
                  itemAddon?.addon_id ===
                    (payloadAddon?.addon_id ?? payloadAddon?.countable_id) &&
                  itemAddon?.quantity === payloadAddon?.quantity,
              ),
            ) &&
            item.bag_id === payload.bag_id
          ),
      );
      state.cartItems = filteredCartItems || [];
      return state;
    },

    setCurrentBag(state, action) {
      const { payload } = action;
      state.currentBag = payload;
    },
    addBag(state, action) {
      const { payload } = action;
      const newBagId = state.bags.length;
      const newData = {
        user: '',
        userUuid: '',
        address: '',
        currentCurrency: '',
        paymentType: '',
        bag_id: newBagId,
        shop: payload?.shop,
        phone: null,
      };
      state.data.push(newData);
      state.bags.push(newBagId);
      state.currentBag = newBagId;
    },
    removeBag(state, action) {
      const { payload } = action;
      state.data = state.data.filter((item) => item.bag_id !== payload);
      state.cartItems = state.cartItems.filter(
        (item) => item.bag_id !== payload,
      );
      state.bags = state.bags.filter((item) => item !== payload);
      state.coupons = state.coupons.filter((item) => item.bag_id !== payload);
      state.currentBag = 0;
    },
    setCartOrder(state, action) {
      const { payload } = action;
      state.cartOrder = payload;
    },
    setCartPayment(state, action) {
      const { payload } = action;
      state.cartPayment = payload;
    },
    setCurrency(state, action) {
      const { payload } = action;
      state.currency = payload;
    },
    setCartShops(state, action) {
      const { payload } = action;
      state.cartShops = payload;
    },
    setCartData(state, action) {
      const { payload } = action;
      const dataIndex = state.data.findIndex(
        (item) => item.bag_id === payload.bag_id,
      );
      state.data[dataIndex] = { ...state.data[dataIndex], ...payload };
    },
    setCartTotal(state, action) {
      const { payload } = action;
      state.total = payload;
    },
    setCartTotalCoupon(state, action) {
      const { payload } = action;
      state.total.couponOBJ = payload;
    },
    setCartCashback(state, action) {
      const { payload } = action;
      state.total.cashback = payload;
    },
    addCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.bag_id === payload.bag_id,
      );
      if (itemIndex >= 0) {
        state.coupons[itemIndex] = {
          ...state.coupons[itemIndex],
          ...payload,
        };
      } else {
        state.coupons.push(payload);
      }
    },
    verifyCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.bag_id === payload.bag_id,
      );
      state.coupons[itemIndex].verified = payload.verified;
      state.coupons[itemIndex].price = payload.price;
      state.coupons[itemIndex].recalculate = payload.recalculate;
    },
    addOrderNotes(state, action) {
      const { payload } = action;
      state.notes[payload.label] = payload.value;
    },
    clearCart(state) {
      state.cartItems = state.cartItems.filter(
        (item) => item.bag_id !== state.currentBag,
      );
      state.coupons = state.coupons.filter(
        (item) => item.bag_id !== state.currentBag,
      );
    },
    clearCartShops(state) {
      state.cartShops = [];
      state.total = initialState.total;
    },
    clearCartCoupon(state, action) {
      const { payload } = action;

      state.data.filter((item) => item.bag_id === payload).coupon = null;
      state.data.filter((item) => item.bag_id === payload).couponOBJ = {};
    },
    clearData(state) {
      state.data = state.data.map((item) =>
        item.bag_id === state.currentBag ? initialState.data[0] : item,
      );
    },
    clearBags(state) {
      state.bags = [0];
      state.currentBag = 0;
      state.data = [initialState.data[0]];
      state.cartItems = [];
      state.cartShops = [];
      state.cartOrder = null;
      state.cartPayment = null;
      state.total = {};
      state.coupons = [];
      state.currency = null;
    },
  },
});

export const {
  setCurrency,
  addToCart,
  removeFromCart,
  clearCart,
  reduceCart,
  setCartShops,
  setCartData,
  clearCartShops,
  setCurrentBag,
  setCartTotal,
  addBag,
  removeBag,
  addCoupon,
  verifyCoupon,
  setCartCashback,
  setCartOrder,
  setCartPayment,
  addOrderNotes,
  setCartTotalCoupon,
  clearData,
  clearBags,
} = cartSlice.actions;
export default cartSlice.reducer;
