import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store';
import { ContextProvider } from './context/context';
import App from './app';
import 'react-toastify/dist/ReactToastify.css';
import 'react-day-picker/dist/style.css';
import './assets/scss/index.scss';

import PageLoading from './components/pageLoading';
import { ReportContextProvider } from './context/report';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<PageLoading />} persistor={persistor}>
        <ContextProvider>
          <ReportContextProvider>
            <App />
          </ReportContextProvider>
        </ContextProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
