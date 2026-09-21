import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Company } from '@/shared/lib/types';

interface UserState {
  user: User | null;
  company: Company | null;
}

const mockUser: User = {
  id: 'dev-admin-user',
  email: 'admin@upskalor.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'super_admin',
  status: 'ACTIVE',
};

const initialState: UserState = {
  user: mockUser,
  company: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setCompany: (state, action: PayloadAction<Company>) => {
      state.company = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.company = null;
    },
  },
});

export const { setUser, setCompany, clearUser } = userSlice.actions;
export default userSlice.reducer;
