import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slice/authSlice';
import categoriesReducer from '../slice/categorySlice';
import productsReducer from '../slice/ProductSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        categories: categoriesReducer,
        products: productsReducer,
    },
});

// Bas ye do line likh lo taaki useSelector me error na aaye, baki sab chill hai
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;