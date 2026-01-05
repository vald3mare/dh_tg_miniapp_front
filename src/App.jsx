import './App.css';
import { useState, useEffect } from 'react';
import HomePage from './Pages/HomePage';
import ServicesPage from './Pages/ServicesPage';
import TariffsPage from './Pages/TariffsPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './Components/NavigationBar';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'tariffs':
        return <TariffsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
      <div className="nav-wrapper">
        <NavigationBar active={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;