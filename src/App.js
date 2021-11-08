import './App.css';
import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Leaderboard from './Leaderboard';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState({
    "Fu": 120,
    "Noa": 100,
    "Steph": 100
  })

  return (
    <ChakraProvider>
      <div className="App">
        <Leaderboard data={data} />
      </div>
    </ChakraProvider>
 );
}

export default App;
