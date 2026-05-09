import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");

  useEffect(() => {
    if (token) setPage("dashboard");
  }, []);

  const handleLogin = (token, email) => {
    setToken(token);
    setUserEmail(email);
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setPage("login");
  };

  return (
    <div className="app">
      {page === "login" && (
        <Login onLogin={handleLogin} onSwitch={() => setPage("register")} />
      )}
      {page === "register" && (
        <Register onSwitch={() => setPage("login")} />
      )}
      {page === "dashboard" && (
        <Dashboard token={token} email={userEmail} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;