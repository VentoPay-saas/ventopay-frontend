import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/product';
import restProductService from '../../services/rest/product';
import sellerProductService from '../../services/seller/product';

const initialState = {
  loading: false,
  products: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
    addon: 0
  },
  links: null,
  meta: {},
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  (params = {}) => {
    return productService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

export const fetchRestProducts = createAsyncThunk(
  'product/fetchRestProducts',
  (params = {}) => {
    return restProductService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

export const fetchSellerProducts = createAsyncThunk(
  'product/fetchSellerProducts',
  (params = {}) => {
    return sellerProductService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data.data.map((item) => ({
        ...item,
        id: item._id,
        uuid: item._id,
        name: item ? item.title : 'no name',
        active: item.active,
        img: item.images,
        category_name: item.category
          ? item.category.title
          : 'no name',
      }));
      state.meta = payload.data.meta;
      state.links = payload.data.links;
      state.params.page = payload.data.meta.current_page;
      state.params.perPage = payload.data.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });

    //rest products
    builder.addCase(fetchRestProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRestProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data.map((item) => ({
        ...item,
        id: item.id,
        uuid: item._id,
        name: item.product ? item.product?.title
          : 'no name',
        active: item.active,
        img: item?.img,
        category_name: item.product?.category
          ? item.product?.category.title
          : 'no name',
        unit: item?.unit_id,
      }));
      state.meta = payload.meta;
      state.links = payload.links;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchRestProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });

    //seller product
    builder.addCase(fetchSellerProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data?.map((item) => ({
        ...item,
        id: item.id,
        uuid: item.uuid,
        name: item ? item?.title : 'no name',
        active: item.active,
        img: item?.img,
        category_name: item?.category
          ? item?.category?.title
          : 'no name',
      }));
      state.meta = payload.meta;
      state.links = payload.links;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchSellerProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });
  },
});

export default productSlice.reducer;
