import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sellerKitchenService from 'services/seller/kitchen';

const initialState = {
  seller: {
    loading: false,
    kitchens: [],
    error: '',
    params: {
      page: 1,
      perPage: 10
    },
    meta: {}
  }
};

export const fetchSellerKitchens = createAsyncThunk(
  'kitchen/fetchSellerKitchens',
  (params = {}) => sellerKitchenService.getAll(params).then((res) => res)
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchSellerKitchens.pending, (state) => {
      state.seller.loading = true;
    });
    builder.addCase(fetchSellerKitchens.fulfilled, (state, action) => {
      const { payload } = action;
      state.seller.loading = false;
      state.seller.kitchens = payload?.data || [];
      state.seller.meta = payload?.meta || {};
      state.seller.params.page = payload?.meta?.current_page || 1;
      state.seller.params.page = payload?.meta?.per_page || 10;
      state.seller.error = '';
    });
    builder.addCase(fetchSellerKitchens.rejected, (state, action) => {
      state.seller.loading = false;
      state.seller.error = action?.error?.message;
      state.seller.kitchens = [];
    });
  }
});

export default kitchenSlice.reducer;