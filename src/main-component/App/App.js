import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AllRoute from '../router'
import ErrorBoundary from '../../components/ErrorBoundary'
import { MemberAuthProvider } from '../../components/MemberAuth'
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


const App = () => {

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <MemberAuthProvider>
          <div className="App" id='scrool'>
                <AllRoute/>
                <ToastContainer/>
          </div>
        </MemberAuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
