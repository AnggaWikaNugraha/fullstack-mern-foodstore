import React from 'react'
import store from './app/store';
import Register from './pages/Register/index';
import RegisterSuccess from './pages/RegisterSucces';
import Login from './pages/Login';
import Home from './pages/Home/index';
import UserAddressAdd from './pages/UserAddressAdd';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { getCart } from './api/cart';
import { listen } from './app/listener';

import 'upkit/dist/style.min.css'

function App() {

  React.useEffect(() => {

    listen();
    // getCart();

  }, [])

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

          <Route path="/register" component={Register} />
          <Route path="/" component={Home} />

        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
