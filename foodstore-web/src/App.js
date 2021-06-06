import logo from './logo.svg';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import 'upkit/dist/style.min.css'
import Home from './pages/Home';

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
