import { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Adjust path if needed

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {/* {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )} */}
      <Dashboard/>
    </>
  );
}

export default App;
