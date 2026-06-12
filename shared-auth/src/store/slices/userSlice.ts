import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/user.service';
import type { UserProfile, UserState } from '../../types';

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: { search?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      return await userService.getUsers(params);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message ?? 'Failed to fetch users');
    }
  },
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await userService.getUserById(id);
    } catch (err: unknown) {
      const error = err as { message?: string };
      return rejectWithValue(error.message ?? 'Failed to fetch user');
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    selectUser(state, action: PayloadAction<UserProfile | null>) {
      state.selectedUser = action.payload;
    },
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      });
  },
});

export const { selectUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
