import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Define the interface for a single Product
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    stock: number;
    productImage: string;
    color: string;
    tagline: string;
    rating: number;
    reviews: number;
    bestseller: boolean;
}

// 2. Define the interface for the Paginated API Response
export interface ProductAPIResponse {
    content: Product[];
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    empty: boolean;
}

// 3. Define the Redux State interface
interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    isLastPage: boolean;
}

const initialState: ProductState = {
    products: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    isLastPage: false,
};

// 4. Create the Async Thunk for fetching paginated products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (
        { page = 0, size = 10, category }: { page?: number; size?: number; category?: string } = {},
        thunkAPI
    ) => {
        try {
            let url = `${BASE_URL}/api/v1/products?page=${page}&size=${size}`;

            if (category) {
                url += `&categoryName=${encodeURIComponent(category)}`;
            }

            const response = await axios.get<ProductAPIResponse>(url);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message || 'Something went wrong'
            );
        }
    }
);

// 5. Create the Async Thunk for Elasticsearch Autocomplete Queries
export const searchProductsByQuery = createAsyncThunk(
    'products/searchProductsByQuery',
    async (query: string, thunkAPI) => {
        try {
            const response = await axios.get<Product[]>(
                `${BASE_URL}/api/v1/product/es/search?query=${encodeURIComponent(query)}`
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message || 'Search failed'
            );
        }
    }
);

// 6. Create the Slice
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearProductState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // --- Standard Pagination Handling ---
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductAPIResponse>) => {
                state.loading = false;
                state.products = action.payload.content || [];
                state.currentPage = action.payload.number;
                state.totalPages = action.payload.totalPages;
                state.totalElements = action.payload.totalElements;
                state.isLastPage = action.payload.last;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // --- Elasticsearch Search Handling ---
            .addCase(searchProductsByQuery.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProductsByQuery.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.loading = false;
                // Sanitization logic: Ensure fallback fields exist in case ES data has missing attributes
                state.products = null;
                state.products = (action.payload.content || []).map((p) => ({
                    ...p,
                    price: p.price ?? 0,
                    rating: p.rating ?? 0,
                    reviews: p.reviews ?? 0,
                    bestseller: p.bestseller ?? false,
                    title: p.name ?? '',
                    description: p.description ?? '',
                    productImage: p.productImage ?? '',
                }));
                state.currentPage = 0;
                state.totalPages = 1;
                state.totalElements = action.payload.length;
                state.isLastPage = true;
            })
            .addCase(searchProductsByQuery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearProductState } = productSlice.actions;
export default productSlice.reducer;