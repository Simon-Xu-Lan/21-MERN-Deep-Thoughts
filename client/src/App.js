import React from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';

// establish a new link to the GraphQL server at its /graphql endpoint with createHttpLink().
const httpLink = createHttpLink({
  uri: '/graphql',
});

// use the ApolloClient() constructor to instantiate the Apollo Client instance 
// and create the connection to the API endpoint.
// also instantiate a new cache object using new InMemoryCache(). 
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// we wrap the entire returning JSX code with <ApolloProvider>. 
// Because we're passing the client variable in as the value for the client prop in the provider, 
// everything between the JSX tags will eventually have access to the server's API data through the client we set up.
function App() {
  return (
    <ApolloProvider client={client}>
      <div className='flex-column justify-flex-start min-100-vh'>
        <Header />
        <div className='container'>
          <Home />
        </div>
        <Footer />
      </div>
    </ApolloProvider>
  );
}

export default App;