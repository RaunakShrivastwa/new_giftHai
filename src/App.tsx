import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store/dataStore";
import { fetchUserDetails } from "./slice/authSlice";

import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileLayout from "./pages/Profile";
import ProfileHome from "./pages/ProfileHome";
import ProfileOrders from "./pages/ProfileOrders";
import ProfileSettings from "./pages/ProfileSettings";
import Loader from "./pages/Loader";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !user) {
      dispatch(fetchUserDetails(savedToken));
    }
  }, [dispatch, user]);

 

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      {loading && <Loader />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/login"
            element={
              token && user ? <Navigate to="/profile" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              token && user ? <Navigate to="/profile" replace /> : <Signup />
            }
          />

          <Route
            path="/checkout"
            element={
              token && user ? <Checkout /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/profile"
            element={
              token && user ? (
                <ProfileLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<ProfileHome />} />
            <Route path="orders" element={<ProfileOrders />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <SiteFooter />
    </div>
  );
}
