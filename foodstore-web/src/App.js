import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import 'upkit/dist/style.min.css'
import Home from './pages/Home';
import { Provider } from 'react-redux';
import store from './app/store';
// (1) import fungsi listen
import { listen } from './app/listener';


function App() {

  // (2) panggil fungsi listen() sekali saja saat komponen selesai render pertama kali
  React.useEffect(() => {
    listen();
  }, [])


  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Provider>

  );
}

export default App;
