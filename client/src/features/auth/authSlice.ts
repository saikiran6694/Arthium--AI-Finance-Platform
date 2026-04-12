import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  access_token: string | null;
  expires_at: number | null;
  refresh_token: string | null;
  user: User | null;
  reportSetting: ReportSetting | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profile_picture: string;
}

interface ReportSetting {
  _id: string;
  frequency?: string;
  is_enabled: boolean;
}

const initialState: AuthState = {
  access_token: null,
  expires_at: null,
  refresh_token: null,
  user: null,
  reportSetting: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<any>) => {
      const now = Date.now();

      state.access_token = action.payload.access_token;
      state.expires_at = now + action.payload.expires_in;
      state.refresh_token = action.payload.refresh_token;
      state.user = action.payload.user;
      state.reportSetting = action.payload.report_settings;
    },

    updateCredentials: (state, action: PayloadAction<any>) => {
      const now = Date.now();
      const { access_token, expires_in } = action.payload;

      if (access_token) state.access_token = access_token;
      if (expires_in) state.expires_at = now + expires_in;
    },

    logout: (state) => {
      state.access_token = null;
      state.expires_at = null;
      state.refresh_token = null;
      state.user = null;
      state.reportSetting = null;
    },
  },
});

export const { setCredentials, updateCredentials, logout } = authSlice.actions;
export default authSlice.reducer;