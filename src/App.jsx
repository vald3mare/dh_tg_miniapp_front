import './App.css';
import { useState, useEffect } from 'react';
import HomePage from './Pages/HomePage';
import ServicesPage from './Pages/ServicesPage';
import TariffsPage from './Pages/TariffsPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './Components/NavigationBar';
import api from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initializeTelegramApp = async () => {
      try {
        // 1️⃣ Инициализируем Telegram WebApp
        if (window.Telegram?.WebApp) {
          console.log('📱 Telegram WebApp инициализирован');
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }

        // 2️⃣ Проверяем есть ли уже authToken
        const existingToken = localStorage.getItem('authToken');
        const existingUserId = localStorage.getItem('userId');

        if (existingToken && existingUserId) {
          console.log('✅ Токен найден в localStorage, пропускаем login');
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        }

        // 3️⃣ Если токена нет - пытаемся получить initData из Telegram
        const initData = window.Telegram?.WebApp?.initData;
        if (!initData) {
          console.warn('⚠️  initData недоступна (может быть VPN или не Telegram)');
          // Даже без initData показываем приложение - логин произойдет в ProfilePage
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        }

        // 4️⃣ Отправляем initData на бэкенд для login
        console.log('🔐 Отправляем initData на бэкенд для login...');
        const loginResponse = await api.login(initData);

        if (loginResponse.token && loginResponse.user) {
          console.log('✅ Login успешен, сохраняем токен и userId');
          localStorage.setItem('authToken', loginResponse.token);
          localStorage.setItem('userId', loginResponse.user.id);
          setIsAuthenticated(true);
        } else {
          console.warn('⚠️  Login response не содержит требуемые поля');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('❌ Ошибка при инициализации:', error.message);
        // Даже при ошибке продолжаем работу - может быть проблема сети или VPN
        setIsAuthenticated(true);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeTelegramApp();
  }, []);

  const renderPage = () => {
    if (isAuthLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f9ff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#476CEE', fontFamily: 'Bartina' }}>
              ⏳ Загрузка приложения...
            </p>
          </div>
        </div>
      );
    }

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
      {isAuthenticated && renderPage()}
      {isAuthenticated && (
        <div className="nav-wrapper">
          <NavigationBar active={currentPage} onNavigate={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

export default App;