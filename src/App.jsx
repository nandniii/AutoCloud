import { useState, useEffect} from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Adjust path if needed

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

 useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
    setIsAuthenticated(true); // ✅ Add this line
  }
}, []);
   
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };



  return (
    <>
      {isAuthenticated ? (
        <Dashboard user={user} handleLogout={handleLogout}/>
      ) : (
        <Login onLoginSuccess={(userData) =>{ 
          setUser(userData);
          setIsAuthenticated(true)} }/>
      )}
      
    </>
  );
}

export default App;
