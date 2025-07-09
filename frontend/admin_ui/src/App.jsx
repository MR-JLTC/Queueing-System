import React, { useState } from "react";
import LoginForm from "./admin/LoginForm";
import ForgotPassword from "./admin/ForgotPassword";
import Dashboard from "./admin/DashBoard";
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

