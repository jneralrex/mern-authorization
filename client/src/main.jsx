import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { persistor, Store } from './redux/Store'; // Make sure the path is correct
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Render the app with Provider and PersistGate
createRoot(document.getElementById('root')).render(
  <Provider store={Store}>  {/* Ensure correct prop name: store, not Store */}
    <PersistGate loading={null} persistor={persistor}> {/* Correctly pass persistor */}
      <App />
    </PersistGate>
  </Provider>
);
