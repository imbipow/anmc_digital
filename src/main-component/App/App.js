import React from 'react';
import AllRoute from '../router'
import ErrorBoundary from '../../components/ErrorBoundary'
import { MemberAuthProvider } from '../../components/MemberAuth'
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


const App = () => {

  return (
    <ErrorBoundary>
      <MemberAuthProvider>
        <div className="App" id='scrool'>
              <AllRoute/>
              <ToastContainer/>
        </div>
      </MemberAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
