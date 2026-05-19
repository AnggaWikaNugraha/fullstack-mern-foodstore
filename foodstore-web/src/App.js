import React from "react";
import store from "./app/store";
import Register from "./pages/Register/index";
import RegisterSuccess from "./pages/RegisterSucces";
import Login from "./pages/Login";
import Home from "./pages/Home/index";
import UserAddressAdd from "./pages/UserAddressAdd";
import UserAddress from "./pages/userAddress";
import Checkout from "./pages/Checkout";
import Invoice from "./pages/invoice";
import Product from "./pages/product";
import Categories from "./pages/categories";
import Tag from "./pages/tag";
import Logout from './pages/logout/index';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AuthCallback from './pages/AuthCallback';
import VerifyEmail from './pages/VerifyEmail';
import CekEmail from './pages/CekEmail';
import ErrorPage from './pages/404'

import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { getCart } from "./api/cart";
import { listen } from "./app/listener";

import "upkit/dist/style.min.css";
import "./App.css";
import OnlyLogin from "./component/OnlyLogin";
import OnlyGuest from "./component/OnlyGuest";
import OnlyAdmin from "./component/OnlyAdmin";
import TopBar from "./component/Topbar";
import SocketNotification from "./component/SocketNotification";

function App() {
  React.useEffect(() => {
    listen();
    getCart();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <TopBar />
        <SocketNotification />
        <Switch>

          <OnlyLogin path="/logout">
            <Logout />
          </OnlyLogin>
          <OnlyLogin path="/account">
            <Account />
          </OnlyLogin>
          <OnlyLogin path="/wishlist">
            <Wishlist />
          </OnlyLogin>
          <OnlyLogin path="/alamat-pengiriman/tambah">
            <UserAddressAdd />
          </OnlyLogin>
          <OnlyLogin path="/alamat-pengiriman/">
            <UserAddress />
          </OnlyLogin>
          <OnlyLogin path="/checkout">
            <Checkout />
          </OnlyLogin>
          <OnlyLogin path="/invoice/:order_id">
            <Invoice />
          </OnlyLogin>

          <Route path="/auth/callback">
            <AuthCallback />
          </Route>
          <Route path="/verify-email">
            <VerifyEmail />
          </Route>
          <Route path="/cek-email">
            <CekEmail />
          </Route>

          <OnlyGuest path="/register">
            <Register />
          </OnlyGuest>
          <OnlyGuest path="/login">
            <Login />
          </OnlyGuest>
          <OnlyGuest path="/register/berhasil">
            <RegisterSuccess />
          </OnlyGuest>

          <OnlyAdmin path="/admin/dashboard">
            <Dashboard />
          </OnlyAdmin>
          <OnlyAdmin path="/admin/orders/:id">
            <AdminOrderDetail />
          </OnlyAdmin>
          <OnlyAdmin path="/admin/orders">
            <AdminOrders />
          </OnlyAdmin>
          <OnlyAdmin path="/admin/product">
            <Product />
          </OnlyAdmin>
          <OnlyAdmin path="/admin/categories">
            <Categories />
          </OnlyAdmin>
          <OnlyAdmin path="/admin/tag">
            <Tag />
          </OnlyAdmin>

          <Route path="/error">
            <ErrorPage />
          </Route>

          <Route path="/" component={Home} />


        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
