import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Category {
    id?: number;
    name: string;
    description: string;
    categoryImage: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Category[]>(`${BASE_URL}/api/v1/categories/by/icons/0`);
            return response.data;
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message || 'Failed to fetch categories');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                action.payload.forEach(cat => {
                    if (cat.categoryImage) {
                        cat.categoryImage = `${BASE_URL}${cat.categoryImage}`;
                    }
                });
                state.categories = action.payload;
                state.error = null;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || 'Failed to fetch categories';
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;