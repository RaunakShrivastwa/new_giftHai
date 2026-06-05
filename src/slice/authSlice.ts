import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
    id: number;
    email: string;
    role: string;
    avtar: string;
    address: any[];
    mobileNumbers: any[];
    fname: string;
    lname: string;
}

interface DecodedToken {
    sub?: string;
    email?: string;
}

interface AuthState {
    token: string | null;
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token') as string | null,
    user: null,
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk<string, any, { rejectValue: string }>(
    'auth/loginUser',
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post<{ accessToken: string }>('http://localhost:8080/api/v1/auth/login', credentials);
            const token = response.data.accessToken;
            localStorage.setItem('token', token);
            dispatch(fetchUserDetails(token) as any);
            return token;
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message || 'Login failed');
        }
    }
);

export const fetchUserDetails = createAsyncThunk<UserProfile, string>(
    'auth/fetchUserDetails',
    async (token) => {
        const decoded = jwtDecode<DecodedToken>(token);
        const email = decoded.sub || decoded.email;
        const response = await axios.get<UserProfile>(`http://localhost:8080/api/v1/user/userEmail/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.token = null;
            state.user = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.token = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || 'Login failed';
            })
            .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<UserProfile>) => {
                state.user = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;