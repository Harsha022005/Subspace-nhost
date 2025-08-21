import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloProvider } from '@apollo/client';
import { client } from './appoloclient';
import { nhost } from './nhost';
import { NhostReactProvider } from '@nhost/react';
// Remove NhostApolloProvider - use custom client instead

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NhostReactProvider nhost={nhost}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </NhostReactProvider>
  </React.StrictMode>
);

reportWebVitals();