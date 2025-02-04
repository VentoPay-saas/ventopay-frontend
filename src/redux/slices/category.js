import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/category';

const initialState = {
  loading: false,
  categories: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  (params = {}) => {
    return categoryService
      .getAllMain({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.categories = payload.data.map((item) => ({
        active: item.active,
        img: item.images,
        name: item.title !== null ? item.title : 'no name',
        key: item._id + '_' + item._id,
        uuid: item._id,
        id: item._id,
        deleted_at: item?.deleted_at,
        status: item.status,
        shop: item.shop_id,
        shop_id: item.shop_id,
        parent_id: item.parent_id
        // children: item.children?.map((child) => ({
        //   name:
        //     child.translation !== null ? child.translation.title : 'no name',
        //   uuid: child.uuid,
        //   key: item.uuid + '_' + child.id,
        //   img: child.img,
        //   id: item.id,
        //   active: child.active,
        //   locales: item.locales,
        //   children: child.children?.map((three) => ({
        //     name:
        //       three.translation !== null ? three.translation.title : 'no name',
        //     uuid: three.uuid,
        //     key: child.uuid + '_' + three.id,
        //     img: three.img,
        //     id: three.id,
        //     active: three.active,
        //     locales: item.locales,
        //   })),
        // })),
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta?.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.categories = [];
      state.error = action.error.message;
    });
  },
});

export default categorySlice.reducer;
