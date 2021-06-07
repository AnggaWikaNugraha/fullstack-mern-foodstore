import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import 'upkit/dist/style.min.css'
import Home from './pages/Home';
import { Provider } from 'react-redux';
import store from './app/store';
// (1) import fungsi listen
import { listen } from './app/listener';
// (1) import komponen Register
import Register from './pages/Register/index';


function App() {

  // (2) panggil fungsi listen() sekali saja saat komponen selesai render pertama kali
  React.useEffect(() => {
    listen();
  }, [])


  return (
    <Provider store={store}>
      <Router>
        <Switch>
          {/* (2) buat route /register */}
          <Route path="/register" component={Register} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Provider>

  );
}

export default App;
