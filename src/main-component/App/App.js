import React from 'react';
import AllRoute from '../router'
import ErrorBoundary from '../../components/ErrorBoundary'
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


const App = () => { 

  return (
    <ErrorBoundary>
      <div className="App" id='scrool'>
            <AllRoute/>
            <ToastContainer/>
      </div>
    </ErrorBoundary>
  );
}

export default App;
