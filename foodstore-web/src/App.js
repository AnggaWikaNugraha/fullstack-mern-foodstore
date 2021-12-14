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
import Logout from './pages/logout/index';
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

function App() {
  React.useEffect(() => {
    listen();
    getCart();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Switch>

          <OnlyLogin path="/logout">
            <Logout />
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

          <OnlyGuest path="/register">
            <Register />
          </OnlyGuest>
          <OnlyGuest path="/login">
            <Login />
          </OnlyGuest>
          <OnlyGuest path="/register/berhasil">
            <RegisterSuccess />
          </OnlyGuest>

          <Route path="/admin/product">
            <Product />
          </Route>
          <OnlyAdmin path="/admin/categories">
            <Categories />
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
