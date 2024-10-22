import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionService from 'services/subscriptions';

const initialState = {
  loading: false,
  subscription: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  (params = {}) => {
    return subscriptionService
      .getOptions({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const subscriptionlice = createSlice({
  name: 'subscription',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchSubscription.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSubscription.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.subscription = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchSubscription.rejected, (state, action) => {
      state.loading = false;
      state.subscription = [];
      state.error = action.error.message;
    });
  },
});

export default subscriptionlice.reducer;
