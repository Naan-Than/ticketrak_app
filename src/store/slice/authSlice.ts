import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userData: null,
  userRole: '',
  token: '',

};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setIsloggedIn: (state, payload: PayloadAction<boolean>) => {
      state.isLoggedIn = payload.payload;
    },
    setUserProfileData: (state, payload: PayloadAction<any>) => {
      state.userData = payload.payload;
    },
    setToken: (state, payload: PayloadAction<string>) => {
      state.token = payload.payload!;
    },
    setUserRole: (state, payload: PayloadAction<string>) => {
      state.userRole = payload.payload!;
    },


   
    setResetUser: state => {
      state.isLoggedIn = false;
      state.userData = null;
      state.userRole = '';
      state.token = '';


    },
  },
});

export const {
  setIsloggedIn,
  setUserProfileData,
  setUserRole,
  setToken,
  setResetUser,

} = authSlice.actions;

export default authSlice.reducer;
