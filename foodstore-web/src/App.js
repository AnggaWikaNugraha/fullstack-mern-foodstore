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

import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { getCart } from "./api/cart";
import { listen } from "./app/listener";

import "upkit/dist/style.min.css";

function App() {
  React.useEffect(() => {
    listen();
    getCart();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>

          <Route path="/register/berhasil">
            <RegisterSuccess />
          </Route>

          <Route path="/alamat-pengiriman/tambah">
            <UserAddressAdd />
          </Route>

          <Route path="/alamat-pengiriman/">
            <UserAddress />
          </Route>

          <Route path="/checkout">
            <Checkout />
          </Route>

          <Route path="/invoice/:order_id">
            <Invoice />
          </Route>

          <Route path="/admin/product">
            <Product />
          </Route>

          <Route path="/register" component={Register} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
