import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPassword from './components/ForgotPassword';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', or 'forgot'

  const handleForgotPassword = () => {
    setCurrentView('forgot');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleGoToSignup = () => {
    setCurrentView('signup');
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="App">
      {currentView === 'login' && (
        <LoginForm 
          onForgotPassword={handleForgotPassword}
          onGoToSignup={handleGoToSignup}
        />
      )}
      {currentView === 'signup' && (
        <SignupForm onGoToLogin={handleGoToLogin} />
      )}
      {currentView === 'forgot' && (
        <ForgotPassword onBackToLogin={handleBackToLogin} />
      )}
    </div>
  );
}

export default App;