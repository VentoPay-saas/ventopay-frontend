import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shopService from '../../services/shop';

const initialState = {
  loading: false,
  shops: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    // role: 'seller',
  },
  meta: {},
};

export const fetchShops = createAsyncThunk('shop/fetchShops', (params = {}) => {
  return shopService
    .getAll({ ...initialState.params, ...params })
    .then((res) => res);
});

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchShops.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShops.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.shops = payload.data?.shops?.map((item) =>
      ({
        created_at: item.created_at,
        active: item.show_type,
        tax: item.tax,
        open: item.open,
        name: item !== null ? item.title : 'no name',
        seller: item.user_id
          ? item.user_id.firstname + ' ' + item.user_id.lastname
          : '',
        uuid: item._id,
        logo_img: item.logo_img.url,
        back: item.background_img.url,
        id: item._id,
        status: item.status,
        deleted_at: item.deleted_at,
        verify: item.verify,
      }));
      state.meta = payload.data.meta;
      state.params.page = payload.data.meta.current_page;
      state.params.perPage = payload.data.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchShops.rejected, (state, action) => {
      state.loading = false;
      state.shops = [];
      state.error = action.error.message;
    });
  },
});

export default shopSlice.reducer;
