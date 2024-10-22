import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: {
    current_tab: 'all',
    free_from: null,
    free_to: null,
    reload: null,
  },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingData(state, action) {
      const { payload } = action;
      state.data = { ...state.data, ...payload };
    },
  },
});

export const { setBookingData } = bookingSlice.actions;
export default bookingSlice.reducer;
