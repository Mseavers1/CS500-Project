import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {UserProvider} from "./components/UserContext";
import {BrowserRouter as Router} from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <UserProvider>
          <Router>
              <App />
          </Router>
      </UserProvider>
  </React.StrictMode>
);
