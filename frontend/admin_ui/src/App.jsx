import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/DashBoard";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("login"); // login, forgot, dashboard

  const handleLoginSuccess = () => {
    setCurrentView("dashboard");
  };

  return (
    <div className="App">
      {currentView === "login" && (
        <LoginForm
          onForgotPassword={() => setCurrentView("forgot")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === "forgot" && (
        <ForgotPassword onBackToLogin={() => setCurrentView("login")} />
      )}
      {currentView === "dashboard" && <Dashboard />}
    </div>
  );
}

export default App;

