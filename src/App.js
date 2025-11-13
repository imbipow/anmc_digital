import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AllRoute from './main-component/router';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <AllRoute />
      </div>
    </HelmetProvider>
  );
}

export default App;
